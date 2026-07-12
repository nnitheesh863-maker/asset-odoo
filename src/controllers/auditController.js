const catchAsync = require('../utils/catchAsync');
const auditService = require('../services/auditService');

const createCycle = catchAsync(async (req, res) => {
  const cycle = await auditService.createCycle(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: cycle });
});

const getAllCycles = catchAsync(async (req, res) => {
  const result = await auditService.getAllCycles({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
  });
  res.status(200).json({ status: 'success', ...result });
});

const getCycleById = catchAsync(async (req, res) => {
  const cycle = await auditService.getCycleById(req.params.id);
  res.status(200).json({ status: 'success', data: cycle });
});

const createAuditItem = catchAsync(async (req, res) => {
  const item = await auditService.createAuditItem(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: item });
});

const updateAuditItem = catchAsync(async (req, res) => {
  const item = await auditService.updateAuditItem(req.params.id, req.body, req.user.id);
  res.status(200).json({ status: 'success', data: item });
});

const completeCycle = catchAsync(async (req, res) => {
  const result = await auditService.completeCycle(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: result });
});

const getAuditStats = catchAsync(async (req, res) => {
  const stats = await auditService.getAuditStats();
  res.status(200).json({ status: 'success', data: stats });
});

const getDiscrepancies = catchAsync(async (req, res) => {
  const discrepancies = await auditService.getDiscrepancies(req.params.id);
  res.status(200).json({ status: 'success', data: discrepancies });
});

module.exports = {
  createCycle,
  getAllCycles,
  getCycleById,
  createAuditItem,
  updateAuditItem,
  completeCycle,
  getAuditStats,
  getDiscrepancies,
};
