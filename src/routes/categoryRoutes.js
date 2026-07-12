const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const categories = await prisma.assetCategory.findMany({
    where: { isActive: true },
    include: { _count: { select: { assets: { where: { isActive: true } } } } },
    orderBy: { name: 'asc' },
  });
  res.status(200).json({ status: 'success', data: categories });
}));

router.get('/:id', catchAsync(async (req, res) => {
  const category = await prisma.assetCategory.findUnique({
    where: { id: req.params.id },
    include: { assets: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
  });
  if (!category) throw new AppError('Category not found', 404);
  res.status(200).json({ status: 'success', data: category });
}));

router.post('/', authorize('ADMIN'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional(),
  body('icon').optional(),
  validate,
], catchAsync(async (req, res) => {
  const { name, description, icon } = req.body;
  const existing = await prisma.assetCategory.findUnique({ where: { name } });
  if (existing) throw new AppError('Category with this name already exists', 400);

  const category = await prisma.assetCategory.create({ data: { name, description, icon } });
  res.status(201).json({ status: 'success', data: category });
}));

router.put('/:id', authorize('ADMIN'), [
  body('name').optional(),
  body('description').optional(),
  body('icon').optional(),
  body('isActive').optional().isBoolean(),
  validate,
], catchAsync(async (req, res) => {
  const category = await prisma.assetCategory.findUnique({ where: { id: req.params.id } });
  if (!category) throw new AppError('Category not found', 404);
  const updated = await prisma.assetCategory.update({ where: { id: req.params.id }, data: req.body });
  res.status(200).json({ status: 'success', data: updated });
}));

router.delete('/:id', authorize('ADMIN'), catchAsync(async (req, res) => {
  const category = await prisma.assetCategory.findUnique({ where: { id: req.params.id } });
  if (!category) throw new AppError('Category not found', 404);
  await prisma.assetCategory.update({ where: { id: req.params.id }, data: { isActive: false } });
  res.status(200).json({ status: 'success', message: 'Category deactivated' });
}));

module.exports = router;
