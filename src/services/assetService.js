const QRCode = require('qrcode');
const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');

const generateAssetCode = async () => {
  const year = new Date().getFullYear();
  const prefix = `AST-${year}`;
  const lastAsset = await prisma.asset.findFirst({
    where: { assetCode: { startsWith: prefix } },
    orderBy: { assetCode: 'desc' },
  });
  if (lastAsset) {
    const lastNum = parseInt(lastAsset.assetCode.split('-')[2], 10);
    return `${prefix}-${String(lastNum + 1).padStart(4, '0')}`;
  }
  return `${prefix}-0001`;
};

const create = async (data, userId) => {
  const category = await prisma.assetCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) {
    throw new AppError('Asset category not found', 404);
  }

  if (data.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) {
      throw new AppError('Department not found', 404);
    }
  }

  const assetCode = await generateAssetCode();

  const asset = await prisma.asset.create({
    data: {
      assetCode,
      name: data.name,
      description: data.description || null,
      serialNumber: data.serialNumber || null,
      model: data.model || null,
      manufacturer: data.manufacturer || null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
      purchasePrice: data.purchasePrice || null,
      currentValue: data.currentValue || data.purchasePrice || null,
      warrantyExpiry: data.warrantyExpiry ? new Date(data.warrantyExpiry) : null,
      location: data.location || null,
      categoryId: data.categoryId,
      departmentId: data.departmentId || null,
      createdById: userId,
      status: 'AVAILABLE',
    },
    include: {
      category: true,
      department: true,
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await logActivity({
    userId,
    action: 'CREATE',
    entity: 'Asset',
    entityId: asset.id,
    newValues: { assetCode, name: data.name, categoryId: data.categoryId },
  });

  return asset;
};

const getAll = async ({
  page = 1,
  limit = 20,
  search,
  status,
  categoryId,
  departmentId,
  condition,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = { isActive: true };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { assetCode: { contains: search, mode: 'insensitive' } },
      { serialNumber: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  const allowedSorts = ['createdAt', 'name', 'assetCode', 'status', 'purchaseDate', 'purchasePrice'];
  const sortField = allowedSorts.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder === 'asc' ? 'asc' : 'desc';

  const [total, assets] = await Promise.all([
    prisma.asset.count({ where }),
    prisma.asset.findMany({
      where,
      skip,
      take: l,
      orderBy: { [sortField]: order },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        allocations: {
          where: { isActive: true },
          include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
          take: 1,
        },
      },
    }),
  ]);

  const mapped = assets.map((a) => {
    const assignedUser = a.allocations.length > 0 ? a.allocations[0].user : null;
    const { allocations, ...rest } = a;
    return { ...rest, assignedUser };
  });

  return paginateResult(mapped, total, p, l);
};

const getById = async (id) => {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      department: true,
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
      allocations: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
      maintenanceRequests: {
        orderBy: { createdAt: 'desc' },
        include: {
          requestedBy: { select: { id: true, firstName: true, lastName: true, email: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  return asset;
};

const update = async (id, data, userId) => {
  const existing = await prisma.asset.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError('Asset not found', 404);
  }

  if (data.categoryId) {
    const category = await prisma.assetCategory.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      throw new AppError('Asset category not found', 404);
    }
  }

  if (data.departmentId) {
    const department = await prisma.department.findUnique({ where: { id: data.departmentId } });
    if (!department) {
      throw new AppError('Department not found', 404);
    }
  }

  const updateData = {};
  const fields = [
    'name', 'description', 'serialNumber', 'model', 'manufacturer',
    'location', 'categoryId', 'departmentId', 'status', 'barcode',
  ];
  fields.forEach((f) => {
    if (data[f] !== undefined) updateData[f] = data[f];
  });
  if (data.purchaseDate !== undefined) updateData.purchaseDate = new Date(data.purchaseDate);
  if (data.purchasePrice !== undefined) updateData.purchasePrice = data.purchasePrice;
  if (data.currentValue !== undefined) updateData.currentValue = data.currentValue;
  if (data.warrantyExpiry !== undefined) updateData.warrantyExpiry = new Date(data.warrantyExpiry);

  const asset = await prisma.asset.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
      department: true,
      createdBy: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await logActivity({
    userId,
    action: 'UPDATE',
    entity: 'Asset',
    entityId: id,
    oldValues: existing,
    newValues: updateData,
  });

  return asset;
};

const remove = async (id, userId) => {
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      allocations: { where: { isActive: true } },
      transferRequests: { where: { status: 'PENDING' } },
      maintenanceRequests: { where: { status: { in: ['REQUESTED', 'SCHEDULED', 'IN_PROGRESS'] } } },
      bookings: { where: { status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] } } },
    },
  });

  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  if (asset.allocations.length > 0) {
    throw new AppError('Cannot delete asset with active allocations. Return the asset first.', 400);
  }
  if (asset.transferRequests.length > 0) {
    throw new AppError('Cannot delete asset with pending transfer requests.', 400);
  }
  if (asset.maintenanceRequests.length > 0) {
    throw new AppError('Cannot delete asset with active maintenance requests.', 400);
  }
  if (asset.bookings.length > 0) {
    throw new AppError('Cannot delete asset with active bookings.', 400);
  }

  await prisma.asset.update({
    where: { id },
    data: { isActive: false, status: 'RETIRED' },
  });

  await logActivity({
    userId,
    action: 'DELETE',
    entity: 'Asset',
    entityId: id,
    oldValues: { status: asset.status, isActive: true },
    newValues: { status: 'RETIRED', isActive: false },
  });

  return { message: 'Asset deleted successfully' };
};

const getByStatus = async (status) => {
  const assets = await prisma.asset.findMany({
    where: { status, isActive: true },
    include: {
      category: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return assets;
};

const getStats = async () => {
  const [total, available, allocated, underMaintenance, retired, lost, reserved] = await Promise.all([
    prisma.asset.count({ where: { isActive: true } }),
    prisma.asset.count({ where: { isActive: true, status: 'AVAILABLE' } }),
    prisma.asset.count({ where: { isActive: true, status: 'ALLOCATED' } }),
    prisma.asset.count({ where: { isActive: true, status: 'UNDER_MAINTENANCE' } }),
    prisma.asset.count({ where: { isActive: true, status: 'RETIRED' } }),
    prisma.asset.count({ where: { isActive: true, status: 'LOST' } }),
    prisma.asset.count({ where: { isActive: true, status: 'RESERVED' } }),
  ]);

  return { total, available, allocated, underMaintenance, retired, lost, reserved };
};

const generateQRCode = async (id) => {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const qrData = JSON.stringify({
    assetCode: asset.assetCode,
    name: asset.name,
    id: asset.id,
  });

  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    type: 'image/png',
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  await prisma.asset.update({
    where: { id },
    data: { qrCode: qrCodeDataUrl },
  });

  return { qrCode: qrCodeDataUrl, assetCode: asset.assetCode };
};

const getAssetTimeline = async (id) => {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const [activityLogs, allocations, transferRequests, maintenanceRequests, bookings] = await Promise.all([
    prisma.activityLog.findMany({
      where: { entity: 'Asset', entityId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.assetAllocation.findMany({
      where: { assetId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.transferRequest.findMany({
      where: { assetId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true } },
        fromDepartment: { select: { id: true, name: true } },
        toDepartment: { select: { id: true, name: true } },
      },
    }),
    prisma.maintenanceRequest.findMany({
      where: { assetId: id },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.booking.findMany({
      where: { assetId: id },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    }),
  ]);

  const events = [];

  events.push({
    type: 'ASSET_CREATED',
    date: asset.createdAt,
    description: `Asset ${asset.assetCode} created`,
    data: { assetCode: asset.assetCode, name: asset.name },
  });

  allocations.forEach((a) => {
    events.push({
      type: 'ASSET_ALLOCATED',
      date: a.allocatedAt,
      description: `Allocated to ${a.user.firstName} ${a.user.lastName}`,
      data: { userId: a.user.id, dueDate: a.dueDate },
    });
    if (a.returnedAt) {
      events.push({
        type: 'ASSET_RETURNED',
        date: a.returnedAt,
        description: `Returned by ${a.user.firstName} ${a.user.lastName}`,
        data: { userId: a.user.id, condition: a.condition },
      });
    }
  });

  transferRequests.forEach((t) => {
    events.push({
      type: `TRANSFER_${t.status}`,
      date: t.createdAt,
      description: `Transfer request to ${t.toDepartment.name} - ${t.status}`,
      data: { transferId: t.id, status: t.status, reason: t.reason },
    });
  });

  maintenanceRequests.forEach((m) => {
    events.push({
      type: `MAINTENANCE_${m.status}`,
      date: m.createdAt,
      description: `Maintenance: ${m.title} - ${m.status}`,
      data: { maintenanceId: m.id, priority: m.priority, status: m.status },
    });
  });

  bookings.forEach((b) => {
    events.push({
      type: `BOOKING_${b.status}`,
      date: b.createdAt,
      description: `Booking by ${b.user.firstName} ${b.user.lastName} - ${b.status}`,
      data: { bookingId: b.id, startDate: b.startDate, endDate: b.endDate },
    });
  });

  activityLogs.forEach((log) => {
    events.push({
      type: 'ACTIVITY',
      date: log.createdAt,
      description: `${log.action} by ${log.user ? log.user.firstName + ' ' + log.user.lastName : 'System'}`,
      data: { action: log.action, oldValues: log.oldValues, newValues: log.newValues },
    });
  });

  events.sort((a, b) => new Date(b.date) - new Date(a.date));

  return events;
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  getByStatus,
  getStats,
  generateQRCode,
  getAssetTimeline,
};
