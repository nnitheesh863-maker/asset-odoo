const allocationService = require('../services/allocationService');
const catchAsync = require('../utils/catchAsync');

exports.createAllocation = catchAsync(async (req, res) => {
  const allocation = await allocationService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: allocation });
});

exports.getAllAllocations = catchAsync(async (req, res) => {
  const result = await allocationService.getAll({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    employeeId: req.query.employeeId,
    assetId: req.query.assetId,
    departmentId: req.query.departmentId,
    search: req.query.search,
  });
  res.status(200).json({ status: 'success', ...result });
});

exports.getAllocationById = catchAsync(async (req, res) => {
  const allocation = await allocationService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: allocation });
});

exports.returnAllocation = catchAsync(async (req, res) => {
  const allocation = await allocationService.returnAsset(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: allocation });
});

exports.updateAllocation = catchAsync(async (req, res) => {
  const allocation = await allocationService.update(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: allocation });
});

exports.getOverdueAllocations = catchAsync(async (req, res) => {
  const allocations = await allocationService.getOverdue();
  res.status(200).json({ status: 'success', data: allocations });
});

exports.getAllocationStats = catchAsync(async (req, res) => {
  const stats = await allocationService.getStats();
  res.status(200).json({ status: 'success', data: stats });
});
