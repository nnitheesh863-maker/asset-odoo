const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationHelper');

const VALID_TRANSITIONS = {
  REQUESTED: ['SCHEDULED', 'CANCELLED'],
  SCHEDULED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

const create = async (data, userId) => {
  const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  if (data.assignedPersonId) {
    const technician = await prisma.user.findUnique({ where: { id: data.assignedPersonId } });
    if (!technician) {
      throw new AppError('Assigned person not found', 404);
    }
  }

  const maintenance = await prisma.maintenanceRequest.create({
    data: {
      assetId: data.assetId,
      requestedById: userId,
      assignedToId: data.assignedPersonId || null,
      title: data.title,
      description: data.description,
      priority: data.priority || 'MEDIUM',
      estimatedCost: data.estimatedCost || null,
      scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : null,
      status: data.assignedPersonId ? 'SCHEDULED' : 'REQUESTED',
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  const managers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'MANAGER'] },
      isActive: true,
      id: { not: userId },
    },
    select: { id: true },
  });

  if (managers.length > 0) {
    const notifications = managers.map((m) => ({
      userId: m.id,
      type: 'MAINTENANCE_REQUESTED',
      title: 'New Maintenance Request',
      message: `A maintenance request has been created for asset ${asset.assetCode}: ${data.title}`,
      link: `/maintenance/${maintenance.id}`,
    }));
    await prisma.notification.createMany({ data: notifications });
  }

  await logActivity({
    userId,
    action: 'CREATE',
    entity: 'MaintenanceRequest',
    entityId: maintenance.id,
    newValues: { assetId: data.assetId, title: data.title, priority: data.priority || 'MEDIUM' },
  });

  return maintenance;
};

const getAll = async ({ page = 1, limit = 20, status, priority, assetId, search }) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (priority) {
    where.priority = priority;
  }

  if (assetId) {
    where.assetId = assetId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { asset: { name: { contains: search, mode: 'insensitive' } } },
      { asset: { assetCode: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, requests] = await Promise.all([
    prisma.maintenanceRequest.count({ where }),
    prisma.maintenanceRequest.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return paginateResult(requests, total, p, l);
};

const updateStatus = async (id, newStatus, userId) => {
  const maintenance = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!maintenance) {
    throw new AppError('Maintenance request not found', 404);
  }

  const allowed = VALID_TRANSITIONS[maintenance.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${maintenance.status} to ${newStatus}`,
      400
    );
  }

  const updateData = { status: newStatus };

  if (newStatus === 'IN_PROGRESS') {
    updateData.startedAt = new Date();
  } else if (newStatus === 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  const updated = await prisma.$transaction(async (tx) => {
    const m = await tx.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (newStatus === 'IN_PROGRESS') {
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: { status: 'UNDER_MAINTENANCE' },
      });
    } else if (newStatus === 'COMPLETED') {
      await tx.asset.update({
        where: { id: maintenance.assetId },
        data: { status: 'AVAILABLE' },
      });
    }

    return m;
  });

  const notificationType = {
    SCHEDULED: 'MAINTENANCE_SCHEDULED',
    IN_PROGRESS: 'MAINTENANCE_SCHEDULED',
    COMPLETED: 'MAINTENANCE_COMPLETED',
  }[newStatus];

  if (notificationType) {
    await createNotification({
      userId: maintenance.requestedById,
      type: notificationType,
      title: `Maintenance ${newStatus.replace('_', ' ').toLowerCase()}`,
      message: `Maintenance "${maintenance.title}" for asset ${maintenance.asset.assetCode} is now ${newStatus.replace('_', ' ').toLowerCase()}.`,
      link: `/maintenance/${id}`,
    });
  }

  if (newStatus === 'COMPLETED' && maintenance.assignedToId) {
    await createNotification({
      userId: maintenance.assignedToId,
      type: 'MAINTENANCE_COMPLETED',
      title: 'Maintenance Completed',
      message: `Maintenance "${maintenance.title}" for asset ${maintenance.asset.assetCode} has been marked as completed.`,
      link: `/maintenance/${id}`,
    });
  }

  await logActivity({
    userId,
    action: 'STATUS_UPDATE',
    entity: 'MaintenanceRequest',
    entityId: id,
    oldValues: { status: maintenance.status },
    newValues: { status: newStatus },
  });

  return updated;
};

const assign = async (id, technicianId, userId) => {
  const maintenance = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!maintenance) {
    throw new AppError('Maintenance request not found', 404);
  }

  if (!['REQUESTED', 'SCHEDULED'].includes(maintenance.status)) {
    throw new AppError('Can only assign technicians to requested or scheduled maintenance', 400);
  }

  const technician = await prisma.user.findUnique({ where: { id: technicianId } });
  if (!technician) {
    throw new AppError('Technician not found', 404);
  }

  const updated = await prisma.maintenanceRequest.update({
    where: { id },
    data: {
      assignedToId: technicianId,
      status: 'SCHEDULED',
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await Promise.all([
    createNotification({
      userId: technicianId,
      type: 'MAINTENANCE_SCHEDULED',
      title: 'Maintenance Assigned to You',
      message: `You have been assigned to maintenance "${maintenance.title}" for asset ${maintenance.asset.assetCode}.`,
      link: `/maintenance/${id}`,
    }),
    logActivity({
      userId,
      action: 'ASSIGN',
      entity: 'MaintenanceRequest',
      entityId: id,
      oldValues: { assignedToId: maintenance.assignedToId },
      newValues: { assignedToId: technicianId },
    }),
  ]);

  return updated;
};

const getById = async (id) => {
  const maintenance = await prisma.maintenanceRequest.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      },
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
    },
  });

  if (!maintenance) {
    throw new AppError('Maintenance request not found', 404);
  }

  return maintenance;
};

const getStats = async () => {
  const [total, requested, scheduled, inProgress, completed, cancelled] = await Promise.all([
    prisma.maintenanceRequest.count(),
    prisma.maintenanceRequest.count({ where: { status: 'REQUESTED' } }),
    prisma.maintenanceRequest.count({ where: { status: 'SCHEDULED' } }),
    prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.maintenanceRequest.count({ where: { status: 'COMPLETED' } }),
    prisma.maintenanceRequest.count({ where: { status: 'CANCELLED' } }),
  ]);

  return { total, requested, scheduled, inProgress, completed, cancelled };
};

const getOverdue = async () => {
  const requests = await prisma.maintenanceRequest.findMany({
    where: {
      status: { in: ['REQUESTED', 'SCHEDULED'] },
      scheduledDate: { lt: new Date() },
    },
    orderBy: { scheduledDate: 'asc' },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  return requests;
};

module.exports = {
  create,
  getAll,
  updateStatus,
  assign,
  getById,
  getStats,
  getOverdue,
};
