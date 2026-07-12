const { body, param } = require('express-validator');

const createTransfer = [
  body('assetId')
    .trim()
    .notEmpty().withMessage('Asset ID is required'),
  body('toDepartmentId')
    .trim()
    .notEmpty().withMessage('Target department ID is required'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

const approveTransfer = [
  param('id').trim().notEmpty().withMessage('Transfer ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

const rejectTransfer = [
  param('id').trim().notEmpty().withMessage('Transfer ID is required'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required'),
];

module.exports = { createTransfer, approveTransfer, rejectTransfer };
