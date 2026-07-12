const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const { getPagination, paginateResult } = require('../utils/pagination');

const create = async (userId, type, title, message, data = {}) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type || 'GENERAL',
      title,
      message,
      link: data.link || null,
    },
  });
  return notification;
};

const getAll = async (userId, { page, limit, isRead } = {}) => {
  const { page: p, limit: l, skip } = getPagination({ page, limit });
  const where = { userId };
  if (isRead !== undefined) where.isRead = isRead === 'true' || isRead === true;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: l,
    }),
    prisma.notification.count({ where }),
  ]);

  return paginateResult(notifications, total, p, l);
};

const getUnreadCount = async (userId) => {
  const count = await prisma.notification.count({
    where: { userId, isRead: false },
  });
  return count;
};

const markAsRead = async (id, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== userId) throw new AppError('Not authorized', 403);

  const updated = await prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });

  return updated;
};

const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { message: 'All notifications marked as read' };
};

const remove = async (id, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new AppError('Notification not found', 404);
  if (notification.userId !== userId) throw new AppError('Not authorized', 403);

  await prisma.notification.delete({ where: { id } });
  return { message: 'Notification deleted' };
};

const createBulk = async (userIds, type, title, message, data = {}) => {
  const notifications = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: type || 'GENERAL',
      title,
      message,
      link: data.link || null,
    })),
  });
  return notifications;
};

module.exports = {
  create,
  getAll,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  delete: remove,
  createBulk,
};
