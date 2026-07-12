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
  if (req.query.userId) where.userId = req.query.userId;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
        approver: { select: { id: true, firstName: true, lastName: true } },
        department: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip, take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  res.status(200).json({ status: 'success', ...paginateResult(bookings, total, page, limit) });
}));

router.post('/', [
  require('express-validator').body('assetId').notEmpty().withMessage('Asset ID is required'),
  require('express-validator').body('startDate').isISO8601().withMessage('Start date is required'),
  require('express-validator').body('endDate').isISO8601().withMessage('End date is required'),
  require('../middleware/validate'),
], catchAsync(async (req, res) => {
  const asset = await prisma.asset.findUnique({ where: { id: req.body.assetId } });
  if (!asset) throw new AppError('Asset not found', 404);

  const booking = await prisma.booking.create({
    data: {
      assetId: req.body.assetId,
      userId: req.user.id,
      departmentId: req.user.departmentId,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      purpose: req.body.purpose,
      notes: req.body.notes,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
    },
  });
  res.status(201).json({ status: 'success', data: booking });
}));

router.put('/:id/approve', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'PENDING') throw new AppError('Booking is not pending', 400);

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'APPROVED', approverId: req.user.id, approvedAt: new Date() },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/reject', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'PENDING') throw new AppError('Booking is not pending', 400);

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'REJECTED', approverId: req.user.id, notes: req.body.notes, cancelReason: req.body.reason },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/complete', catchAsync(async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'ACTIVE') throw new AppError('Booking is not active', 400);

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

router.put('/:id/cancel', catchAsync(async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) throw new AppError('Booking not found', 404);
  if (!['PENDING', 'APPROVED'].includes(booking.status)) throw new AppError('Booking cannot be cancelled', 400);

  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status: 'CANCELLED', cancelledAt: new Date(), cancelReason: req.body.reason || 'Cancelled by user' },
  });
  res.status(200).json({ status: 'success', data: updated });
}));

module.exports = router;
