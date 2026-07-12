const dotenv = require("dotenv");
dotenv.config();

const config = {
  DATABASE_URL: process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/assetflow?schema=public",
  JWT_SECRET: process.env.JWT_SECRET || "assetflow-jwt-secret-key-2024-enterprise",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "assetflow-jwt-refresh-secret-key-2024-enterprise",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASS: process.env.SMTP_PASS || "",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "uploads",
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
};

module.exports = config;
