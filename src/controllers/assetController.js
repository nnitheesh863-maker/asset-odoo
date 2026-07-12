const assetService = require('../services/assetService');
const catchAsync = require('../utils/catchAsync');

exports.createAsset = catchAsync(async (req, res) => {
  const asset = await assetService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: asset });
});

exports.getAllAssets = catchAsync(async (req, res) => {
  const result = await assetService.getAll({
    page: req.query.page,
    limit: req.query.limit,
    search: req.query.search,
    status: req.query.status,
    categoryId: req.query.categoryId,
    departmentId: req.query.departmentId,
    condition: req.query.condition,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  });
  res.status(200).json({ status: 'success', ...result });
});

exports.getAssetStats = catchAsync(async (req, res) => {
  const stats = await assetService.getStats();
  res.status(200).json({ status: 'success', data: stats });
});

exports.getAssetById = catchAsync(async (req, res) => {
  const asset = await assetService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: asset });
});

exports.getAssetTimeline = catchAsync(async (req, res) => {
  const timeline = await assetService.getAssetTimeline(req.params.id);
  res.status(200).json({ status: 'success', data: timeline });
});

exports.updateAsset = catchAsync(async (req, res) => {
  const asset = await assetService.update(req.params.id, req.body, req.user.id);
  res.status(200).json({ status: 'success', data: asset });
});

exports.deleteAsset = catchAsync(async (req, res) => {
  const result = await assetService.remove(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', ...result });
});

exports.getAssetQRCode = catchAsync(async (req, res) => {
  const data = await assetService.generateQRCode(req.params.id);
  res.status(200).json({ status: 'success', data });
});
