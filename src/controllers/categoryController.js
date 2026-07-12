const categoryService = require('../services/categoryService');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const category = await categoryService.create({ name, description });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  const result = await categoryService.getAll({ page: Number(page), limit: Number(limit), search, sortBy, sortOrder });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getById = catchAsync(async (req, res) => {
  const category = await categoryService.getById(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: { category },
  });
});

exports.update = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const category = await categoryService.update(Number(req.params.id), { name, description });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

exports.delete = catchAsync(async (req, res) => {
  await categoryService.delete(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});
