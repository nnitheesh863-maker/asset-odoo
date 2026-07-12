const { prisma } = require('../config/database');
const { getPagination, paginateResult } = require('../utils/pagination');

const log = async ({ userId, action, entity, entityId, oldValues, newValues, description, ipAddress, userAgent }) => {
  const activityLog = await prisma.activityLog.create({
    data: {
      userId: userId || null,
      action,
      entity,
      entityId: entityId || null,
      oldValues: oldValues || null,
      newValues: newValues || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
  return activityLog;
};

const getAll = async ({ page, limit, userId, action, entity, startDate, endDate } = {}) => {
  const { page: p, limit: l, skip } = getPagination({ page, limit });
  const where = {};

  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entity) where.entity = entity;
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
    prisma.activityLog.count({ where }),
  ]);

  return paginateResult(logs, total, p, l);
};

const getRecent = async (limit = 10) => {
  const logs = await prisma.activityLog.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
  });
  return logs;
};

const getByEntity = async (entity, entityId) => {
  const logs = await prisma.activityLog.findMany({
    where: { entity, entityId },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return logs;
};

module.exports = { log, getAll, getRecent, getByEntity };
