const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');
const { logActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationHelper');

const create = async (data, userId) => {
  const asset = await prisma.asset.findUnique({ where: { id: data.assetId } });
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  if (asset.status === 'RETIRED' || asset.status === 'LOST') {
    throw new AppError('Asset is not available for booking', 400);
  }

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end <= start) {
    throw new AppError('End date must be after start date', 400);
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      assetId: data.assetId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
      startDate: { lt: end },
      endDate: { gt: start },
    },
  });

  if (conflict) {
    throw new AppError('Asset is already booked for the selected time period', 409);
  }

  const booking = await prisma.booking.create({
    data: {
      assetId: data.assetId,
      userId,
      departmentId: asset.departmentId,
      startDate: start,
      endDate: end,
      purpose: data.purpose || null,
      notes: data.notes || null,
      status: 'PENDING',
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
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
      type: 'BOOKING_REQUESTED',
      title: 'New Booking Request',
      message: `A booking request has been made for asset ${asset.assetCode} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`,
      link: `/bookings/${booking.id}`,
    }));
    await prisma.notification.createMany({ data: notifications });
  }

  await logActivity({
    userId,
    action: 'CREATE',
    entity: 'Booking',
    entityId: booking.id,
    newValues: { assetId: data.assetId, startDate: start, endDate: end },
  });

  return booking;
};

const getAll = async ({ page = 1, limit = 20, status, assetId, userId, departmentId, search }) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = {};

  if (status) {
    where.status = status;
  }

  if (assetId) {
    where.assetId = assetId;
  }

  if (userId) {
    where.userId = userId;
  }

  if (departmentId) {
    where.departmentId = departmentId;
  }

  if (search) {
    where.OR = [
      { asset: { name: { contains: search, mode: 'insensitive' } } },
      { asset: { assetCode: { contains: search, mode: 'insensitive' } } },
      { user: { firstName: { contains: search, mode: 'insensitive' } } },
      { user: { lastName: { contains: search, mode: 'insensitive' } } },
      { purpose: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true } },
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return paginateResult(bookings, total, p, l);
};

const approve = async (id, managerId) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { asset: true, user: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== 'PENDING') {
    throw new AppError('Booking is not pending', 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approverId: managerId,
      approvedAt: new Date(),
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await Promise.all([
    createNotification({
      userId: booking.userId,
      type: 'BOOKING_APPROVED',
      title: 'Booking Approved',
      message: `Your booking for asset ${booking.asset.assetCode} has been approved.`,
      link: `/bookings/${id}`,
    }),
    logActivity({
      userId: managerId,
      action: 'APPROVE',
      entity: 'Booking',
      entityId: id,
      newValues: { status: 'APPROVED' },
    }),
  ]);

  return updated;
};

const reject = async (id, managerId, reason) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { asset: true, user: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.status !== 'PENDING') {
    throw new AppError('Booking is not pending', 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approverId: managerId,
      cancelReason: reason || null,
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await Promise.all([
    createNotification({
      userId: booking.userId,
      type: 'BOOKING_REJECTED',
      title: 'Booking Rejected',
      message: `Your booking for asset ${booking.asset.assetCode} has been rejected.${reason ? ' Reason: ' + reason : ''}`,
      link: `/bookings/${id}`,
    }),
    logActivity({
      userId: managerId,
      action: 'REJECT',
      entity: 'Booking',
      entityId: id,
      newValues: { status: 'REJECTED', reason },
    }),
  ]);

  return updated;
};

const cancel = async (id, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { asset: true },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  if (booking.userId !== userId) {
    throw new AppError('You can only cancel your own bookings', 403);
  }

  if (!['PENDING', 'APPROVED'].includes(booking.status)) {
    throw new AppError('Booking cannot be cancelled in its current status', 400);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
    include: {
      asset: { select: { id: true, assetCode: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });

  await logActivity({
    userId,
    action: 'CANCEL',
    entity: 'Booking',
    entityId: id,
    newValues: { status: 'CANCELLED' },
  });

  return updated;
};

const getAvailable = async (assetId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const conflictingBookings = await prisma.booking.findMany({
    where: {
      assetId,
      status: { in: ['PENDING', 'APPROVED', 'ACTIVE'] },
      startDate: { lt: endOfDay },
      endDate: { gt: startOfDay },
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      startDate: true,
      endDate: true,
      purpose: true,
      status: true,
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  const bookedSlots = conflictingBookings.map((b) => ({
    bookingId: b.id,
    start: b.startDate,
    end: b.endDate,
    purpose: b.purpose,
    status: b.status,
    bookedBy: b.user,
  }));

  const availableSlots = [];
  let current = new Date(startOfDay);

  const sortedBookings = conflictingBookings.sort(
    (a, b) => new Date(a.startDate) - new Date(b.startDate)
  );

  for (const booking of sortedBookings) {
    const bookingStart = new Date(booking.startDate);
    if (current < bookingStart) {
      availableSlots.push({ start: new Date(current), end: new Date(bookingStart) });
    }
    current = new Date(Math.max(current.getTime(), new Date(booking.endDate).getTime()));
  }

  if (current < endOfDay) {
    availableSlots.push({ start: new Date(current), end: new Date(endOfDay) });
  }

  return { bookedSlots, availableSlots };
};

const getMyBookings = async (userId, page = 1, limit = 20) => {
  const { page: p, limit: l, skip } = getPagination(page, limit);

  const where = { userId };

  const [total, bookings] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.findMany({
      where,
      skip,
      take: l,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true } },
        approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    }),
  ]);

  return paginateResult(bookings, total, p, l);
};

const getById = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      asset: {
        include: {
          category: { select: { id: true, name: true } },
          department: { select: { id: true, name: true } },
        },
      },
      user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      approver: { select: { id: true, firstName: true, lastName: true, email: true } },
      department: { select: { id: true, name: true } },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return booking;
};

module.exports = {
  create,
  getAll,
  approve,
  reject,
  cancel,
  getAvailable,
  getMyBookings,
  getById,
};
