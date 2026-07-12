const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getPagination, paginateResult } = require('../utils/pagination');

router.use(protect);

router.get('/', catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.priority) where.priority = req.query.priority;
  if (req.query.assignedToId) where.assignedToId = req.query.assignedToId;

  const [requests, total] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  res.status(200).json({ status: 'success', ...paginateResult(requests, total, page, limit) });
}));

router.get('/:id', catchAsync(async (req, res) => {
  const request = await prisma.maintenanceRequest.findUnique({
    where: { id: req.params.id },
    include: {
      asset: { select: { id: true, assetCode: true, name: true, status: true } },
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!request) throw new AppError('Maintenance request not found', 404);
  res.status(200).json({ status: 'success', data: request });
}));

router.post('/', [
  require('express-validator').body('assetId').notEmpty().withMessage('Asset ID is required'),
  require('express-validator').body('title').notEmpty().withMessage('Title is required'),
  require('express-validator').body('description').notEmpty().withMessage('Description is required'),
  require('../middleware/validate'),
], catchAsync(async (req, res) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.body.assetId } });
  if (!asset) throw new AppError('Asset not found', 404);

  const request = await prisma.maintenanceRequest.create({
    data: {
      assetId: req.body.assetId,
      requestedById: req.user.id,
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'MEDIUM',
      estimatedCost: req.body.estimatedCost,
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : null,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
  res.status(201).json({ status: 'success', data: request });
}));

router.put('/:id/assign', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new AppError('Maintenance request not found', 404);

  const updated = await prisma.maintenanceRequest.update({
    where: { id: req.params.id },
    data: {
      assignedToId: req.body.assignedToId,
      status: 'SCHEDULED',
      scheduledDate: req.body.scheduledDate ? new Date(req.body.scheduledDate) : request.scheduledDate,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/status', catchAsync(async (req, res) => {
  const request = await prisma.maintenanceRequest.findUnique({ where: { id: req.params.id } });
  if (!request) throw new AppError('Maintenance request not found', 404);

  const updateData = { status: req.body.status };
  if (req.body.status === 'IN_PROGRESS') updateData.startedAt = new Date();
  if (req.body.status === 'COMPLETED') {
    updateData.completedAt = new Date();
    if (req.body.actualCost) updateData.actualCost = req.body.actualCost;
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id: req.params.id },
    data: updateData,
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

module.exports = router;
