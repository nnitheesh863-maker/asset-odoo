const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationHelper');

const create = async (data, requestedBy) => {
  const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  if (!asset.departmentId) {
    throw new AppError('Asset is not assigned to any department', 400);
  }

  if (asset.departmentId === data.toDepartmentId) {
    throw new AppError('Cannot transfer asset to the same department', 400);
  }

  const toDepartment = await prisma.department.findUnique({ where: { id: data.toDepartmentId } });
  if (!toDepartment) {
    throw new AppError('Target department not found', 404);
  }

  const existingPending = await prisma.transferRequest.findFirst({
    where: {
      assetId: data.assetId,
      status: 'PENDING',
    },
  });

  if (existingPending) {
    throw new AppError('A pending transfer request already exists for this asset', 400);
  }

  const transfer = await prisma.transferRequest.create({
    data: {
      assetId: data.assetId,
      requesterId: requestedBy,
      fromDepartmentId: asset.departmentId,
      toDepartmentId: data.toDepartmentId,
      reason: data.reason || null,
      notes: data.notes || null,
      status: 'PENDING',
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      fromDepartment: { select: { id: true, name: true } },
      toDepartment: { select: { id: true, name: true } },
    },
  });

  const managers = await prisma.user.findMany({
    where: {
      role: { in: ['ADMIN', 'MANAGER'] },
      isActive: true,
      id: { not: requestedBy },
    },
    select: { id: true },
  });

  if (managers.length > 0) {
    const notifications = managers.map((m) => ({
      userId: m.id,
      type: 'TRANSFER_REQUESTED',
      title: 'New Transfer Request',
      message: `A transfer request has been made for asset ${asset.assetCode} from ${transfer.fromDepartment.name} to ${transfer.toDepartment.name}.`,
      link: `/transfers/${transfer.id}`,
    }));
    await prisma.notification.createMany({ data: notifications });
  }

  await logActivity({
    userId: requestedBy,
    action: 'CREATE',
    entity: 'TransferRequest',
    entityId: transfer.id,
    newValues: { assetId: data.assetId, toDepartmentId: data.toDepartmentId },
  });

  return transfer;
};

const getAll = async ({ page = 1, limit = 20, status, search }) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { asset: { name: { contains: search, mode: 'insensitive' } } },
      { asset: { assetCode: { contains: search, mode: 'insensitive' } } },
      { requester: { firstName: { contains: search, mode: 'insensitive' } } },
      { requester: { lastName: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [total, transfers] = await Promise.all([
    prisma.transferRequest.count({ where }),
    prisma.transferRequest.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return paginateResult(transfers, total, p, l);
};

const approve = async (id, managerId) => {
  const transfer = await prisma.transferRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!transfer) {
    throw new AppError('Transfer request not found', 404);
  }

  if (transfer.status !== 'PENDING') {
    throw new AppError('Transfer request is not pending', 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const t = await tx.transferRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approverId: managerId,
        approvedAt: new Date(),
        completedAt: new Date(),
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        requester: { select: { id: true, firstName: true, lastName: true, email: true } },
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
      },
    });

    await tx.asset.update({
      where: { id: transfer.assetId },
      data: { departmentId: transfer.toDepartmentId },
    });

    return t;
  });

  await Promise.all([
    createNotification({
      userId: transfer.requesterId,
      type: 'TRANSFER_APPROVED',
      title: 'Transfer Request Approved',
      message: `Your transfer request for asset ${transfer.asset.assetCode} has been approved.`,
      link: `/transfers/${id}`,
    }),
    logActivity({
      userId: managerId,
      action: 'APPROVE',
      entity: 'TransferRequest',
      entityId: id,
      newValues: { status: 'APPROVED' },
    }),
  ]);

  return updated;
};

const reject = async (id, managerId, reason) => {
  const transfer = await prisma.transferRequest.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!transfer) {
    throw new AppError('Transfer request not found', 404);
  }

  if (transfer.status !== 'PENDING') {
    throw new AppError('Transfer request is not pending', 400);
  }

  const updated = await prisma.transferRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approverId: managerId,
      notes: reason,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      requester: { select: { id: true, firstName: true, lastName: true, email: true } },
      fromDepartment: { select: { id: true, name: true } },
      toDepartment: { select: { id: true, name: true } },
    },
  });

  await Promise.all([
    createNotification({
      userId: transfer.requesterId,
      type: 'TRANSFER_REJECTED',
      title: 'Transfer Request Rejected',
      message: `Your transfer request for asset ${transfer.asset.assetCode} has been rejected. Reason: ${reason}`,
      link: `/transfers/${id}`,
    }),
    logActivity({
      userId: managerId,
      action: 'REJECT',
      entity: 'TransferRequest',
      entityId: id,
      newValues: { status: 'REJECTED', reason },
    }),
  ]);

  return updated;
};

const getById = async (id) => {
  const transfer = await prisma.transferRequest.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          category: { select: { id: true, name: true } },
        },
      },
      requester: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      fromDepartment: true,
      toDepartment: true,
      approver: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  if (!transfer) {
    throw new AppError('Transfer request not found', 404);
  }

  return transfer;
};

module.exports = { create, getAll, approve, reject, getById };
