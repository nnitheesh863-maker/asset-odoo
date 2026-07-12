const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationHelper');

const create = async (data, managerId) => {
  const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }
  if (asset.status !== 'AVAILABLE') {
    throw new AppError('Asset is not available for allocation', 400);
  }

  const employee = await prisma.user.findUnique({ where: { id: data.employeeId } });
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  const allocation = await prisma.$transaction(async (tx) => {
    const alloc = await tx.assetAllocation.create({
      data: {
        assetId: data.assetId,
        userId: data.employeeId,
        allocatedBy: managerId,
        allocatedAt: data.assignedDate ? new Date(data.assignedDate) : new Date(),
        dueDate: data.expectedReturnDate ? new Date(data.expectedReturnDate) : null,
        notes: data.remarks || null,
        condition: data.condition || null,
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await tx.asset.update({
      where: { id: data.assetId },
      data: { status: 'ALLOCATED' },
    });

    return alloc;
  });

  await createNotification({
    userId: data.employeeId,
    type: 'ASSET_ALLOCATED',
    title: 'Asset Assigned to You',
    message: `Asset ${asset.assetCode} (${asset.name}) has been assigned to you.`,
    link: `/assets/${asset.id}`,
  });

  await logActivity({
    userId: managerId,
    action: 'ALLOCATE',
    entity: 'Asset',
    entityId: data.assetId,
    newValues: { allocatedTo: data.employeeId, allocationId: allocation.id },
  });

  return allocation;
};

const getAll = async ({
  page = 1,
  limit = 20,
  status,
  employeeId,
  assetId,
  departmentId,
  search,
}) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = {};

  if (status === 'active') {
    where.isActive = true;
    where.returnedAt = null;
  } else if (status === 'returned') {
    where.isActive = false;
    where.returnedAt = { not: null };
  } else if (status === 'overdue') {
    where.isActive = true;
    where.returnedAt = null;
    where.dueDate = { lt: new Date() };
  }

  if (employeeId) {
    where.userId = employeeId;
  }

  if (assetId) {
    where.assetId = assetId;
  }

  if (departmentId) {
    where.asset = { departmentId };
  }

  if (search) {
    where.OR = [
      { asset: { name: { contains: search, mode: 'insensitive' } } },
      { asset: { assetCode: { contains: search, mode: 'insensitive' } } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, allocations] = await Promise.all([
    prisma.assetAllocation.count({ where }),
    prisma.assetAllocation.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: { id: true, assetCode: true, name: true, status: true, location: true },
        },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return paginateResult(allocations, total, p, l);
};

const getById = async (id) => {
  const allocation = await prisma.assetAllocation.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      },
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, departmentId: true } },
    },
  });

  if (!allocation) {
    throw new AppError('Allocation not found', 404);
  }

  return allocation;
};

const returnAsset = async (id, userId) => {
  const allocation = await prisma.assetAllocation.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!allocation) {
    throw new AppError('Allocation not found', 404);
  }

  if (!allocation.isActive || allocation.returnedAt) {
    throw new AppError('Asset has already been returned', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const alloc = await tx.assetAllocation.update({
      where: { id },
      data: {
        returnedAt: new Date(),
        isActive: false,
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    await tx.asset.update({
      where: { id: allocation.assetId },
      data: { status: 'AVAILABLE' },
    });

    return alloc;
  });

  await logActivity({
    userId,
    action: 'RETURN',
    entity: 'Asset',
    entityId: allocation.assetId,
    newValues: { returnedAt: updated.returnedAt, allocationId: id },
  });

  return updated;
};

const update = async (id, data) => {
  const allocation = await prisma.assetAllocation.findUnique({ where: { id } });
  if (!allocation) {
    throw new AppError('Allocation not found', 404);
  }

  const updateData = {};
  if (data.expectedReturnDate !== undefined) {
    updateData.dueDate = new Date(data.expectedReturnDate);
  }
  if (data.remarks !== undefined) {
    updateData.notes = data.remarks;
  }
  if (data.condition !== undefined) {
    updateData.condition = data.condition;
  }

  const updated = await prisma.assetAllocation.update({
    where: { id },
    data: updateData,
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return updated;
};

const getOverdue = async () => {
  const allocations = await prisma.assetAllocation.findMany({
    where: {
      isActive: true,
      returnedAt: null,
      dueDate: { lt: new Date() },
    },
    orderBy: { dueDate: 'asc' },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return allocations;
};

const getStats = async () => {
  const now = new Date();

  const [total, active, returned, overdue] = await Promise.all([
    prisma.assetAllocation.count(),
    prisma.assetAllocation.count({ where: { isActive: true, returnedAt: null } }),
    prisma.assetAllocation.count({ where: { returnedAt: { not: null } } }),
    prisma.assetAllocation.count({
      where: { isActive: true, returnedAt: null, dueDate: { lt: now } },
    }),
  ]);

  return { total, active, returned, overdue };
};

module.exports = {
  create,
  getAll,
  getById,
  returnAsset,
  update,
  getOverdue,
  getStats,
};
