const { body, param, query } = require('express-validator');

const createDepartmentValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const updateDepartmentValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid department ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
];

const getDepartmentValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid department ID'),
];

const getDepartmentsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search term too long'),
  query('sortBy')
    .optional()
    .isIn(['name', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

module.exports = {
  createDepartmentValidation,
  updateDepartmentValidation,
  getDepartmentValidation,
  getDepartmentsValidation,
};
