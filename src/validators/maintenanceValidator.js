const { body, param } = require('express-validator');

const createMaintenance = [
  body('assetId')
    .trim()
    .notEmpty().withMessage('Asset ID is required'),
  body('title')
    .trim()
    .notEmpty().withMessage('Issue title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('priority')
    .optional()
    .trim()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('assignedPersonId')
    .optional()
    .trim(),
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
  body('scheduledDate')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date'),
];

const updateMaintenance = [
  param('id').trim().notEmpty().withMessage('Maintenance ID is required'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('priority')
    .optional()
    .trim()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).withMessage('Priority must be LOW, MEDIUM, HIGH, or CRITICAL'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Description must not exceed 2000 characters'),
  body('estimatedCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Estimated cost must be a positive number'),
  body('actualCost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Actual cost must be a positive number'),
  body('scheduledDate')
    .optional()
    .isISO8601().withMessage('Scheduled date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
];

module.exports = { createMaintenance, updateMaintenance };
