const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { users: true, assets: true } },
    },
    orderBy: { name: 'asc' },
  });
  res.status(200).json({ status: 'success', data: departments });
}));

router.get('/:id', catchAsync(async (req, res) => {
  const department = await prisma.department.findUnique({
    where: { id: req.params.id },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
      users: { select: { id: true, firstName: true, lastName: true, email: true, role: true }, where: { isActive: true } },
      _count: { select: { assets: true } },
    },
  });
  if (!department) throw new AppError('Department not found', 404);
  res.status(200).json({ status: 'success', data: department });
}));

router.post('/', authorize('ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('managerId').optional(),
  validate,
], catchAsync(async (req, res) => {
  const { name, description, managerId, parentId } = req.body;
  const department = await prisma.department.create({
    data: { name, description, managerId, parentId },
  });
  res.status(201).json({ status: 'success', data: department });
}));

router.put('/:id', authorize('ADMIN'), [
  body('name').optional(),
  body('description').optional(),
  body('managerId').optional(),
  body('isActive').optional().isBoolean(),
  validate,
], catchAsync(async (req, res) => {
  const department = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!department) throw new AppError('Department not found', 404);

  const updated = await prisma.department.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.delete('/:id', authorize('ADMIN'), catchAsync(async (req, res) => {
  const department = await prisma.department.findUnique({ where: { id: req.params.id } });
  if (!department) throw new AppError('Department not found', 404);

  await prisma.department.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(200).json({ status: 'success', message: 'Department deactivated' });
}));

module.exports = router;
