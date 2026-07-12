const maintenanceService = require('../services/maintenanceService');
const catchAsync = require('../utils/catchAsync');

exports.createMaintenance = catchAsync(async (req, res) => {
  const maintenance = await maintenanceService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: maintenance });
});

exports.getAllMaintenance = catchAsync(async (req, res) => {
  const result = await maintenanceService.getAll({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    priority: req.query.priority,
    assetId: req.query.assetId,
    search: req.query.search,
  });
  res.status(200).json({ status: 'success', ...result });
});

exports.getMaintenanceById = catchAsync(async (req, res) => {
  const maintenance = await maintenanceService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: maintenance });
});

exports.updateMaintenanceStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const maintenance = await maintenanceService.updateStatus(req.params.id, status, req.user.id);
  res.status(200).json({ status: 'success', data: maintenance });
});

exports.assignMaintenance = catchAsync(async (req, res) => {
  const maintenance = await maintenanceService.assign(req.params.id, req.body.technicianId, req.user.id);
  res.status(200).json({ status: 'success', data: maintenance });
});

exports.getMaintenanceStats = catchAsync(async (req, res) => {
  const stats = await maintenanceService.getStats();
  res.status(200).json({ status: 'success', data: stats });
});

exports.getOverdueMaintenance = catchAsync(async (req, res) => {
  const requests = await maintenanceService.getOverdue();
  res.status(200).json({ status: 'success', data: requests });
});
