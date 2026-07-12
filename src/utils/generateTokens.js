const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/env");
const prisma = require("../config/database");

function generateAccessToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };

  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

function generateRefreshToken(user) {
  const payload = {
    id: user.id,
    tokenVersion: 1,
  };

  return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.JWT_REFRESH_SECRET);
}

async function generateTokenPair(user, req = null) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decoded = jwt.decode(refreshToken);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      ipAddress: req?.ip || null,
      userAgent: req?.get("user-agent") || null,
      expiresAt: new Date(decoded.exp * 1000),
    },
  });

  return { accessToken, refreshToken };
}

async function rotateRefreshToken(oldRefreshToken, req = null) {
  const decoded = verifyRefreshToken(oldRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error("Invalid or expired refresh token");
  }

  await prisma.refreshToken.delete({
    where: { id: storedToken.id },
  });

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || !user.isActive) {
    throw new Error("User not found or inactive");
  }

  return generateTokenPair(user, req);
}

async function revokeRefreshToken(token) {
  return prisma.refreshToken.deleteMany({
    where: { token },
  });
}

async function revokeAllUserRefreshTokens(userId) {
  return prisma.refreshToken.deleteMany({
    where: { userId },
  });
}

async function cleanExpiredRefreshTokens() {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  cleanExpiredRefreshTokens,
};
