const express = require('express');
const router = express.Router();
const { prisma } = require('../config/database');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const { getPagination, paginateResult } = require('../utils/pagination');

router.use(protect);

router.get('/', authorize('ADMIN', 'MANAGER'), catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const where = { isActive: true };
  if (req.query.departmentId) where.departmentId = req.query.departmentId;
  if (req.query.role) where.role = req.query.role;

  const [employees, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        avatar: true, role: true, departmentId: true, isActive: true, lastLoginAt: true, createdAt: true,
        department: { select: { id: true, name: true } },
      },
      orderBy: { firstName: 'asc' },
      skip, take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  res.status(200).json({ status: 'success', ...paginateResult(employees, total, page, limit) });
}));

router.get('/:id', catchAsync(async (req, res) => {
  const employee = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true, email: true, firstName: true, lastName: true, phone: true,
      avatar: true, role: true, departmentId: true, isActive: true, lastLoginAt: true, createdAt: true,
      department: { select: { id: true, name: true } },
      _count: {
        select: {
          allocations: { where: { isActive: true } },
          bookings: true,
          maintenanceRequests: true,
        },
      },
    },
  });
  if (!employee) throw new AppError('Employee not found', 404);
  res.status(200).json({ status: 'success', data: employee });
}));

module.exports = router;
