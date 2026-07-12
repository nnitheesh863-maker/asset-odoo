const employeeService = require('../services/employeeService');
const catchAsync = require('../utils/catchAsync');

exports.create = catchAsync(async (req, res) => {
  const { name, email, password, phone, departmentId, designation, role, joinDate } = req.body;
  const employee = await employeeService.create({ name, email, password, phone, departmentId, designation, role, joinDate });

  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: { employee },
  });
});

exports.getAll = catchAsync(async (req, res) => {
  const { page, limit, search, departmentId, status, role, sortBy, sortOrder } = req.query;
  const result = await employeeService.getAll({
    page: Number(page),
    limit: Number(limit),
    search,
    departmentId: departmentId ? Number(departmentId) : undefined,
    status,
    role,
    sortBy,
    sortOrder,
  });

  res.status(200).json({
    success: true,
    data: result,
  });
});

exports.getById = catchAsync(async (req, res) => {
  const employee = await employeeService.getById(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: { employee },
  });
});

exports.update = catchAsync(async (req, res) => {
  const employee = await employeeService.update(Number(req.params.id), req.body);

  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: { employee },
  });
});

exports.delete = catchAsync(async (req, res) => {
  await employeeService.delete(Number(req.params.id));

  res.status(200).json({
    success: true,
    message: 'Employee deactivated successfully',
  });
});

exports.getEmployeeStats = catchAsync(async (req, res) => {
  const { departmentId } = req.query;
  const stats = await employeeService.getEmployeeStats(departmentId ? Number(departmentId) : undefined);

  res.status(200).json({
    success: true,
    data: { stats },
  });
});

exports.getEmployeeAssets = catchAsync(async (req, res) => {
  const result = await employeeService.getEmployeeAssets(Number(req.params.id));

  res.status(200).json({
    success: true,
    data: result,
  });
});
