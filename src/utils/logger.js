const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");
const fs = require("fs");

const logDir = path.join(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  let msg = `${ts} [${level}]: ${message}`;
  if (stack) {
    msg += `\n${stack}`;
  }
  if (Object.keys(meta).length > 0) {
    msg += ` ${JSON.stringify(meta)}`;
  }
  return msg;
});

const fileFormat = combine(
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  errors({ stack: true }),
  json()
);

const transports = {
  console: new winston.transports.Console({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
    format: combine(
      colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      consoleFormat
    ),
  }),

  errorFile: new DailyRotateFile({
    filename: path.join(logDir, "error-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "error",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "30d",
    zippedArchive: true,
  }),

  combinedFile: new DailyRotateFile({
    filename: path.join(logDir, "combined-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "info",
    format: fileFormat,
    maxSize: "20m",
    maxFiles: "14d",
    zippedArchive: true,
  }),

  auditFile: new DailyRotateFile({
    filename: path.join(logDir, "audit-%DATE%.log"),
    datePattern: "YYYY-MM-DD",
    level: "info",
    format: fileFormat,
    maxSize: "50m",
    maxFiles: "90d",
    zippedArchive: true,
  }),
};

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  levels: winston.config.npm.levels,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: [
    transports.console,
    transports.errorFile,
    transports.combinedFile,
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "exceptions.log"),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, "rejections.log"),
      format: fileFormat,
    }),
  ],
});

logger.audit = (message, meta = {}) => {
  transports.auditFile.info(message, meta);
};

module.exports = logger;
