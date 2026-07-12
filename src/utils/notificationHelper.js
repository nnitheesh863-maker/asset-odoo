const { prisma } = require('../config/database');

const createNotification = async ({ userId, type, title, message, link }) => {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
};

const createBulkNotifications = async (notifications) => {
  return prisma.notification.createMany({
    data: notifications,
  });
};

module.exports = { createNotification, createBulkNotifications };
