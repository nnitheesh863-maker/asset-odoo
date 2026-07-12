const crypto = require('crypto');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateTokens, verifyRefreshToken } = require('../utils/generateTokens');
const sendEmail = require('../utils/sendEmail');

class AuthService {
  async register({ name, email, password, phone }) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('An account with this email already exists', 409);
    }

    if (phone) {
      const existingPhone = await prisma.user.findUnique({ where: { phone } });
      if (existingPhone) {
        throw new AppError('An account with this phone number already exists', 409);
      }
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        departmentId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        details: `User ${user.email} registered successfully`,
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(
        `Your account is ${user.status.toLowerCase()}. Please contact administrator.`,
        403
      );
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User ${user.email} logged in`,
      },
    });

    const { password: _, resetPasswordToken: __, resetPasswordExpire: ___, ...safeUser } = user;

    return { user: safeUser, accessToken, refreshToken };
  }

  async logout(userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'LOGOUT',
        details: `User ${user.email} logged out`,
      },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(token) {
    if (!token) {
      throw new AppError('Refresh token is required', 400);
    }

    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        refreshToken: true,
      },
    });

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('User account is not active', 403);
    }

    if (user.refreshToken !== token) {
      throw new AppError('Refresh token is invalid or has been revoked', 401);
    }

    const tokens = generateTokens(user.id, user.role);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return tokens;
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError('No account found with this email address', 404);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('User account is not active', 403);
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const resetURL = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a73e8;">AssetFlow Password Reset</h2>
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetURL}" style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #1a73e8;
          color: #ffffff;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="color: #666; font-size: 12px;">AssetFlow Enterprise Asset Management</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'AssetFlow - Password Reset Request',
      html,
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'FORGOT_PASSWORD',
        details: `Password reset requested for ${user.email}`,
      },
    });

    return { message: 'Password reset link sent to your email address' };
  }

  async resetPassword(token, password) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
        refreshToken: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'RESET_PASSWORD',
        details: `Password reset completed for ${user.email}`,
      },
    });

    return { message: 'Password has been reset successfully. Please log in with your new password.' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId,
        action: 'CHANGE_PASSWORD',
        details: `Password changed for ${user.email}`,
      },
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        departmentId: true,
        department: { select: { id: true, name: true, description: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}

module.exports = new AuthService();
