const { body, param, query } = require('express-validator');

const createBooking = [
  body('assetId')
    .trim()
    .notEmpty().withMessage('Asset ID is required'),
  body('startDate')
    .trim()
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .trim()
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date'),
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Purpose must not exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

const updateBooking = [
  param('id').trim().notEmpty().withMessage('Booking ID is required'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('End date must be a valid date'),
  body('purpose')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Purpose must not exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

module.exports = { createBooking, updateBooking };
