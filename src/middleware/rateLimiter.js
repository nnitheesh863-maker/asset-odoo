const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many requests. Please try again later.",
  },
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"] || "unknown";
  },
  handler: (req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  keyGenerator: (req) => {
    return req.ip || req.headers["x-forwarded-for"] || req.body.email || "unknown";
  },
  handler: (req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many password reset attempts. Please try again after 1 hour.",
  },
  handler: (req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many file uploads. Please try again later.",
  },
  handler: (req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: "fail",
    message: "Too many API requests. Please slow down.",
  },
  handler: (req, res, _next, options) => {
    res.status(429).json(options.message);
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  uploadLimiter,
  apiLimiter,
};
