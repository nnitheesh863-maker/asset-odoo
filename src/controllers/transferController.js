const transferService = require('../services/transferService');
const catchAsync = require('../utils/catchAsync');

exports.createTransfer = catchAsync(async (req, res) => {
  const transfer = await transferService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: transfer });
});

exports.getAllTransfers = catchAsync(async (req, res) => {
  const result = await transferService.getAll({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    search: req.query.search,
  });
  res.status(200).json({ status: 'success', ...result });
});

exports.getTransferById = catchAsync(async (req, res) => {
  const transfer = await transferService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: transfer });
});

exports.approveTransfer = catchAsync(async (req, res) => {
  const transfer = await transferService.approve(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: transfer });
});

exports.rejectTransfer = catchAsync(async (req, res) => {
  const transfer = await transferService.reject(req.params.id, req.user.id, req.body.reason);
  res.status(200).json({ status: 'success', data: transfer });
});
