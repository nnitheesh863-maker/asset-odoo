const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notificationService');

const getAll = catchAsync(async (req, res) => {
  const result = await notificationService.getAll(req.user.id, {
    page: req.query.page,
    limit: req.query.limit,
    isRead: req.query.isRead,
  });
  res.status(200).json({ status: 'success', ...result });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.status(200).json({ status: 'success', data: { count } });
});

const markAsRead = catchAsync(async (req, res) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: notification });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(200).json({ status: 'success', data: result });
});

const remove = catchAsync(async (req, res) => {
  const result = await notificationService.delete(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: result });
});

module.exports = { getAll, getUnreadCount, markAsRead, markAllAsRead, remove };
