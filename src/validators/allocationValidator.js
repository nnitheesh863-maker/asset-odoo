const { body, param, query } = require('express-validator');

const createAllocation = [
  body('assetId')
    .trim()
    .notEmpty().withMessage('Asset ID is required'),
  body('employeeId')
    .trim()
    .notEmpty().withMessage('Employee ID is required'),
  body('assignedDate')
    .optional()
    .isISO8601().withMessage('Assigned date must be a valid date'),
  body('expectedReturnDate')
    .optional()
    .isISO8601().withMessage('Expected return date must be a valid date'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters'),
  body('condition')
    .optional()
    .trim()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Condition must be NEW, GOOD, FAIR, POOR, or DAMAGED'),
];

const updateAllocation = [
  param('id').trim().notEmpty().withMessage('Allocation ID is required'),
  body('expectedReturnDate')
    .optional()
    .isISO8601().withMessage('Expected return date must be a valid date'),
  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters'),
  body('condition')
    .optional()
    .trim()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Condition must be NEW, GOOD, FAIR, POOR, or DAMAGED'),
];

const returnAllocation = [
  param('id').trim().notEmpty().withMessage('Allocation ID is required'),
  body('condition')
    .optional()
    .trim()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Condition must be NEW, GOOD, FAIR, POOR, or DAMAGED'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
];

module.exports = { createAllocation, updateAllocation, returnAllocation };
