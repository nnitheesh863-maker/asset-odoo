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

  const [transfers, total] = await Promise.all([
    prisma.transferRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        requester: { select: { id: true, firstName: true, lastName: true } },
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.transferRequest.count({ where }),
  ]);

  res.status(200).json({ status: 'success', ...paginateResult(transfers, total, page, limit) });
}));

router.post('/', [
  require('express-validator').body('assetId').notEmpty().withMessage('Asset ID is required'),
  require('express-validator').body('toDepartmentId').notEmpty().withMessage('Target department is required'),
  require('../middleware/validate'),
], catchAsync(async (req, res) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.body.assetId } });
  if (!asset) throw new AppError('Asset not found', 404);
  if (!asset.departmentId) throw new AppError('Asset must have a current department', 400);

  const transfer = await prisma.transferRequest.create({
    data: {
      assetId: req.body.assetId,
      requesterId: req.user.id,
      fromDepartmentId: asset.departmentId,
      toDepartmentId: req.body.toDepartmentId,
      reason: req.body.reason,
      notes: req.body.notes,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      fromDepartment: { select: { id: true, name: true } },
      toDepartment: { select: { id: true, name: true } },
    },
  });
  res.status(201).json({ status: 'success', data: transfer });
}));

router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: req.params.id } });
  if (!transfer) throw new AppError('Transfer not found', 404);
  if (transfer.status !== 'PENDING') throw new AppError('Transfer is not pending', 400);

  const updated = await prisma.transferRequest.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED', approverId: req.user.id, approvedAt: new Date() },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/reject', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: req.params.id } });
  if (!transfer) throw new AppError('Transfer not found', 404);
  if (transfer.status !== 'PENDING') throw new AppError('Transfer is not pending', 400);

  const updated = await prisma.transferRequest.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', approverId: req.user.id, notes: req.body.notes },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/complete', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const transfer = await prisma.transferRequest.findUnique({ where: { id: req.params.id } });
  if (!transfer) throw new AppError('Transfer not found', 404);
  if (transfer.status !== 'APPROVED') throw new AppError('Transfer must be approved first', 400);

  await prisma.asset.update({
    where: { id: transfer.assetId },
    data: { departmentId: transfer.toDepartmentId },
  });

  const updated = await prisma.transferRequest.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

module.exports = router;
