const { body, param, query } = require('express-validator');

const createAsset = [
  body('name')
    .trim()
    .notEmpty().withMessage('Asset name is required')
    .isLength({ max: 200 }).withMessage('Asset name must not exceed 200 characters'),
  body('categoryId')
    .trim()
    .notEmpty().withMessage('Category ID is required'),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Serial number must not exceed 100 characters'),
  body('purchaseDate')
    .optional()
    .isISO8601().withMessage('Purchase date must be a valid date'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location must not exceed 300 characters'),
  body('condition')
    .optional()
    .trim()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Condition must be NEW, GOOD, FAIR, POOR, or DAMAGED'),
  body('warrantyExpiry')
    .optional()
    .isISO8601().withMessage('Warranty expiry must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Manufacturer must not exceed 100 characters'),
  body('departmentId')
    .optional()
    .trim(),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Current value must be a positive number'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Barcode must not exceed 100 characters'),
];

const updateAsset = [
  param('id').trim().notEmpty().withMessage('Asset ID is required'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Asset name must not exceed 200 characters'),
  body('categoryId')
    .optional()
    .trim(),
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Serial number must not exceed 100 characters'),
  body('purchaseDate')
    .optional()
    .isISO8601().withMessage('Purchase date must be a valid date'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Purchase price must be a positive number'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Location must not exceed 300 characters'),
  body('condition')
    .optional()
    .trim()
    .isIn(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']).withMessage('Condition must be NEW, GOOD, FAIR, POOR, or DAMAGED'),
  body('warrantyExpiry')
    .optional()
    .isISO8601().withMessage('Warranty expiry must be a valid date'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),
  body('model')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Model must not exceed 100 characters'),
  body('manufacturer')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Manufacturer must not exceed 100 characters'),
  body('status')
    .optional()
    .trim()
    .isIn(['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED', 'LOST', 'RESERVED'])
    .withMessage('Status must be a valid asset status'),
  body('departmentId')
    .optional()
    .trim(),
  body('currentValue')
    .optional()
    .isFloat({ min: 0 }).withMessage('Current value must be a positive number'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Barcode must not exceed 100 characters'),
];

const searchAssets = [
  query('query')
    .optional()
    .trim(),
  query('status')
    .optional()
    .trim()
    .isIn(['AVAILABLE', 'ALLOCATED', 'UNDER_MAINTENANCE', 'RETIRED', 'LOST', 'RESERVED'])
    .withMessage('Status must be a valid asset status'),
  query('categoryId')
    .optional()
    .trim(),
  query('departmentId')
    .optional()
    .trim(),
  query('condition')
    .optional()
    .trim(),
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

module.exports = { createAsset, updateAsset, searchAssets };
