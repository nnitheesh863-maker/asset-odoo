const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');

const createCycle = async (data, userId) => {
  const cycle = await prisma.auditCycle.create({
    data: {
      title: data.title,
      description: data.description,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      createdById: userId,
    },
    include: { createdBy: { select: { id: true, firstName: true, lastName: true, email: true } } },
  });
  return cycle;
};

const getAllCycles = async ({ page, limit, status }) => {
  const { page: p, limit: l, skip } = getPagination({ page, limit });
  const where = {};
  if (status) where.status = status;

  const [cycles, total] = await Promise.all([
    prisma.auditCycle.findMany({
      where,
      include: {
        createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { auditItems: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
    prisma.auditCycle.count({ where }),
  ]);

  const data = cycles.map((c) => ({
    ...c,
    itemCount: c._count.auditItems,
    _count: undefined,
  }));

  return paginateResult(data, total, p, l);
};

const getCycleById = async (id) => {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      auditItems: {
        include: {
          asset: {
            select: { id: true, assetCode: true, name: true, status: true, location: true, serialNumber: true },
          },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!cycle) throw new AppError('Audit cycle not found', 404);
  return cycle;
};

const createAuditItem = async (data, userId) => {
  const cycle = await prisma.auditCycle.findUnique({ where: { id: data.cycleId } });
  if (!cycle) throw new AppError('Audit cycle not found', 404);
  if (cycle.status === 'COMPLETED') throw new AppError('Cannot add items to a completed audit cycle', 400);

  const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
  if (!asset) throw new AppError('Asset not found', 404);

  const existingItem = await prisma.auditItem.findFirst({
    where: { auditCycleId: data.cycleId, assetId: data.assetId },
  });
  if (existingItem) throw new AppError('Asset already exists in this audit cycle', 400);

  const item = await prisma.auditItem.create({
    data: {
      auditCycleId: data.cycleId,
      assetId: data.assetId,
      findings: data.findings,
      condition: data.condition,
      location: data.location,
      status: data.status || 'DRAFT',
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true, status: true, location: true } },
      auditCycle: { select: { id: true, title: true, status: true } },
    },
  });

  if (cycle.status === 'DRAFT') {
    await prisma.auditCycle.update({ where: { id: cycle.id }, data: { status: 'IN_PROGRESS' } });
  }

  return item;
};

const updateAuditItem = async (id, data, userId) => {
  const item = await prisma.auditItem.findUnique({ where: { id } });
  if (!item) throw new AppError('Audit item not found', 404);

  const cycle = await prisma.auditCycle.findUnique({ where: { id: item.auditCycleId } });
  if (cycle.status === 'COMPLETED') throw new AppError('Cannot update items in a completed audit cycle', 400);

  const updateData = {};
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'COMPLETED') updateData.completedAt = new Date();
  }
  if (data.findings !== undefined) updateData.findings = data.findings;
  if (data.condition !== undefined) updateData.condition = data.condition;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;

  const updated = await prisma.auditItem.update({
    where: { id },
    data: updateData,
    include: {
      asset: { select: { id: true, assetCode: true, name: true, status: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  return updated;
};

const completeCycle = async (id, userId) => {
  const cycle = await prisma.auditCycle.findUnique({
    where: { id },
    include: { auditItems: true },
  });
  if (!cycle) throw new AppError('Audit cycle not found', 404);
  if (cycle.status === 'COMPLETED') throw new AppError('Audit cycle is already completed', 400);
  if (cycle.auditItems.length === 0) throw new AppError('Cannot complete an audit cycle with no items', 400);

  const discrepancies = cycle.auditItems.filter((item) => item.status !== 'COMPLETED');
  const completed = cycle.auditItems.filter((item) => item.status === 'COMPLETED');

  const updated = await prisma.auditCycle.update({
    where: { id },
    data: { status: 'COMPLETED' },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
      auditItems: {
        include: {
          asset: { select: { id: true, assetCode: true, name: true } },
        },
      },
    },
  });

  return {
    ...updated,
    summary: {
      totalItems: cycle.auditItems.length,
      completedItems: completed.length,
      discrepancies: discrepancies.length,
      completionRate: ((completed.length / cycle.auditItems.length) * 100).toFixed(1),
    },
  };
};

const getAuditStats = async () => {
  const [total, completed, inProgress, draft, overdue] = await Promise.all([
    prisma.auditCycle.count(),
    prisma.auditCycle.count({ where: { status: 'COMPLETED' } }),
    prisma.auditCycle.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.auditCycle.count({ where: { status: 'DRAFT' } }),
    prisma.auditCycle.count({ where: { status: 'OVERDUE' } }),
  ]);

  const totalItems = await prisma.auditItem.count();
  const discrepancyCount = await prisma.auditItem.count({
    where: { status: { not: 'COMPLETED' }, auditCycle: { status: 'COMPLETED' } },
  });

  return {
    totalCycles: total,
    completed,
    inProgress,
    draft,
    overdue,
    totalItems,
    discrepancyCount,
  };
};

const getDiscrepancies = async (cycleId) => {
  const cycle = await prisma.auditCycle.findUnique({ where: { id: cycleId } });
  if (!cycle) throw new AppError('Audit cycle not found', 404);

  const discrepancies = await prisma.auditItem.findMany({
    where: {
      auditCycleId: cycleId,
      status: { not: 'COMPLETED' },
    },
    include: {
      asset: {
        select: { id: true, assetCode: true, name: true, status: true, location: true, serialNumber: true },
      },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  return discrepancies;
};

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
