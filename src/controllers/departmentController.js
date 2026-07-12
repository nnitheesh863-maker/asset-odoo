const departmentService = require('../services/departmentService');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const department = await departmentService.create({ name, description });

  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: { department },
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const { page, limit, search, sortBy, sortOrder } = req.query;
  const result = await departmentService.getAll({ page: Number(page), limit: Number(limit), search, sortBy, sortOrder });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getById = catchAsync(async (req, res) => {
  const department = await departmentService.getById(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: { department },
  });
});

exports.update = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const department = await departmentService.update(Number(req.params.id), { name, description });

  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: { department },
  });
});

exports.delete = catchAsync(async (req, res) => {
  await departmentService.delete(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: 'Department deleted successfully',
  });
});

exports.getDepartmentStats = catchAsync(async (req, res) => {
  const result = await departmentService.getDepartmentStats(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: result,
  });
});
