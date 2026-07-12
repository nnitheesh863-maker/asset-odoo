const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');

const createAuditCycle = [
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('description').optional().trim(),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      if (new Date(endDate) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  validate,
];

const createAuditItem = [
  body('cycleId').notEmpty().withMessage('Cycle ID is required').trim(),
  body('assetId').notEmpty().withMessage('Asset ID is required').trim(),
  body('findings').optional().trim(),
  body('condition').optional().trim(),
  body('location').optional().trim(),
  body('status').optional().isIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  validate,
];

const updateAuditItem = [
  param('id').notEmpty().withMessage('Item ID is required').trim(),
  body('status').optional().isIn(['DRAFT', 'IN_PROGRESS', 'COMPLETED']).withMessage('Invalid status'),
  body('findings').optional().trim(),
  body('condition').optional().trim(),
  body('location').optional().trim(),
  body('imageUrl').optional().trim(),
  validate,
];

module.exports = { createAuditCycle, createAuditItem, updateAuditItem };
