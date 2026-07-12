const config = require("../config/env");
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  if (config.NODE_ENV === "development") {
    logger.error(`Error: ${err.message}`, {
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user?.id,
    });
  } else {
    logger.error(`Error: ${err.message}`, {
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.id,
    });
  }

  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    return handlePrismaError(err, res);
  }

  if (err.name === "PrismaClientValidationError") {
    return res.status(400).json({
      status: "fail",
      message: "Data validation error",
      ...(config.NODE_ENV === "development" && { detail: err.message }),
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token. Please log in again.",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      status: "fail",
      message: "Token expired. Please log in again.",
    });
  }

  if (err.name === "MulterError") {
    const message = handleMulterError(err);
    return res.status(400).json({
      status: "fail",
      message,
    });
  }

  if (err.type === "entity.too.large") {
    return res.status(413).json({
      status: "fail",
      message: "Request entity too large.",
    });
  }

  const statusCode = err.statusCode || 500;
  const message =
    config.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : err.message || "Internal server error";

  return res.status(statusCode).json({
    status: "error",
    message,
    ...(config.NODE_ENV === "development" && {
      stack: err.stack,
      detail: err.message,
    }),
  });
};

function handlePrismaError(err, res) {
  const code = err.code;

  switch (code) {
    case "P2002": {
      const target = err.meta?.target;
      const fields = Array.isArray(target) ? target.join(", ") : "field";
      return res.status(409).json({
        status: "fail",
        message: `A record with this ${fields} already exists.`,
        errors: [
          {
            field: fields,
            message: `Duplicate value for ${fields}`,
          },
        ],
      });
    }

    case "P2025": {
      return res.status(404).json({
        status: "fail",
        message: "The requested record was not found or has been deleted.",
      });
    }

    case "P2003": {
      const field = err.meta?.field_name || "related record";
      return res.status(400).json({
        status: "fail",
        message: `Related record not found. Invalid reference to ${field}.`,
      });
    }

    case "P2014": {
      return res.status(400).json({
        status: "fail",
        message: "This operation requires a related record that is missing.",
      });
    }

    case "P2023": {
      return res.status(400).json({
        status: "fail",
        message: "Data type mismatch. Please check your input.",
      });
    }

    default:
      logger.error(`Unhandled Prisma error: ${code}`, err);
      return res.status(500).json({
        status: "error",
        message:
          config.NODE_ENV === "production"
            ? "A database error occurred."
            : `Database error: ${err.message}`,
      });
  }
}

function handleMulterError(err) {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      return "File is too large.";
    case "LIMIT_FILE_COUNT":
      return "Too many files uploaded.";
    case "LIMIT_FILE_COUNT":
      return "Too many files.";
    case "LIMIT_UNEXPECTED_FILE":
      return "Unexpected file field.";
    case "MISSING_REQ_BODY_NO_FILE":
      return "No file uploaded.";
    default:
      return `Upload error: ${err.message}`;
  }
}

module.exports = errorHandler;
