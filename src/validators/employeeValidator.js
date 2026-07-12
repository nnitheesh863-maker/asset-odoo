const { body, param, query } = require('express-validator');

const createEmployeeValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$/).withMessage('Please provide a valid phone number'),
  body('departmentId')
    .notEmpty().withMessage('Department is required')
    .isInt({ min: 1 }).withMessage('Invalid department ID'),
  body('designation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('joinDate')
    .optional()
    .isISO8601().withMessage('Invalid join date format'),
];

const updateEmployeeValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid employee ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^\+?[\d\s-]{7,15}$/).withMessage('Please provide a valid phone number'),
  body('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid department ID'),
  body('designation')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Role must be ADMIN, MANAGER, or EMPLOYEE'),
  body('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'TERMINATED']).withMessage('Status must be ACTIVE, INACTIVE, or TERMINATED'),
];

const getEmployeeValidation = [
  param('id')
    .isInt({ min: 1 }).withMessage('Invalid employee ID'),
];

const getEmployeesValidation = [
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
  query('departmentId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid department ID'),
  query('status')
    .optional()
    .isIn(['ACTIVE', 'INACTIVE', 'TERMINATED']).withMessage('Invalid status'),
  query('role')
    .optional()
    .isIn(['ADMIN', 'MANAGER', 'EMPLOYEE']).withMessage('Invalid role'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'createdAt', 'joinDate', 'employeeCode']).withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc'),
];

module.exports = {
  createEmployeeValidation,
  updateEmployeeValidation,
  getEmployeeValidation,
  getEmployeesValidation,
};
