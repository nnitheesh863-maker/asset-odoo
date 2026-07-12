const nodemailer = require("nodemailer");
const config = require("../config/env");
const logger = require("./logger");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: config.NODE_ENV === "production",
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html, text, attachments = [] }) {
  try {
    const transport = getTransporter();

    const mailOptions = {
      from: `"AssetFlow" <${config.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(", ") : to,
      subject,
      html,
      text: text || stripHtml(html),
      attachments,
    };

    const info = await transport.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

function stripHtml(html) {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function sendWelcomeEmail(user, temporaryPassword) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #6b7280; }
        .credentials { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 15px 0; }
        .btn { display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to AssetFlow</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div class="credentials">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Password:</strong> ${temporaryPassword}</p>
          </div>
          <p>Please change your password after your first login for security purposes.</p>
          <p style="text-align: center;">
            <a href="${config.CLIENT_URL}/login" class="btn">Login to AssetFlow</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AssetFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "Welcome to AssetFlow - Your Account is Ready",
    html,
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  const resetUrl = `${config.CLIENT_URL}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #6b7280; }
        .btn { display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 10px; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName},</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="btn">Reset Password</a>
          </p>
          <div class="warning">
            <p><strong>This link will expire in 15 minutes.</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AssetFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: "AssetFlow - Password Reset Request",
    html,
  });
}

async function sendMaintenanceNotification(user, maintenanceRequest, type) {
  const subjectMap = {
    SCHEDULED: "Maintenance Scheduled",
    COMPLETED: "Maintenance Completed",
    REQUESTED: "Maintenance Request Submitted",
    IN_PROGRESS: "Maintenance In Progress",
  };

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 10px; font-size: 12px; color: #6b7280; }
        .detail { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${subjectMap[type] || "Maintenance Update"}</h1>
        </div>
        <div class="content">
          <p>Hello ${user.firstName},</p>
          <p>${subjectMap[type] || "There has been an update to a maintenance request"}:</p>
          <div class="detail">
            <p><strong>Title:</strong> ${maintenanceRequest.title}</p>
            <p><strong>Asset:</strong> ${maintenanceRequest.asset?.name || "N/A"}</p>
            <p><strong>Priority:</strong> ${maintenanceRequest.priority}</p>
            <p><strong>Status:</strong> ${maintenanceRequest.status}</p>
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} AssetFlow. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: user.email,
    subject: `AssetFlow - ${subjectMap[type] || "Maintenance Update"}`,
    html,
  });
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendMaintenanceNotification,
};
