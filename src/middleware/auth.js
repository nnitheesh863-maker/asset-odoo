const jwt = require("jsonwebtoken");
const config = require("../config/env");
const prisma = require("../config/database");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const logger = require("../utils/logger");

const authenticate = catchAsync(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    return next(new AppError("Authentication required. Please log in.", 401));
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        departmentId: true,
        phone: true,
        avatar: true,
      },
    });

    if (!user) {
      return next(new AppError("User account no longer exists.", 401));
    }

    if (!user.isActive) {
      return next(new AppError("User account has been deactivated. Contact administrator.", 403));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Token expired. Please refresh your session.", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token. Please log in again.", 401));
    }
    logger.error("Authentication error:", error);
    return next(new AppError("Authentication failed.", 401));
  }
});

const optionalAuth = catchAsync(async (req, res, next) => {
  let token = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        departmentId: true,
      },
    });

    req.user = user && user.isActive ? user : null;
  } catch {
    req.user = null;
  }

  next();
});

module.exports = { authenticate, optionalAuth };
