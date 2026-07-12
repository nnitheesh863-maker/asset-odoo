const bookingService = require('../services/bookingService');
const catchAsync = require('../utils/catchAsync');

exports.createBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.create(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: booking });
});

exports.getAllBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getAll({
    page: req.query.page,
    limit: req.query.limit,
    status: req.query.status,
    assetId: req.query.assetId,
    userId: req.query.userId,
    departmentId: req.query.departmentId,
    search: req.query.search,
  });
  res.status(200).json({ status: 'success', ...result });
});

exports.getBookingById = catchAsync(async (req, res) => {
  const booking = await bookingService.getById(req.params.id);
  res.status(200).json({ status: 'success', data: booking });
});

exports.approveBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.approve(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: booking });
});

exports.rejectBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.reject(req.params.id, req.user.id, req.body.reason);
  res.status(200).json({ status: 'success', data: booking });
});

exports.cancelBooking = catchAsync(async (req, res) => {
  const booking = await bookingService.cancel(req.params.id, req.user.id);
  res.status(200).json({ status: 'success', data: booking });
});

exports.getAvailableSlots = catchAsync(async (req, res) => {
  const { assetId, date } = req.query;
  const result = await bookingService.getAvailable(assetId, date);
  res.status(200).json({ status: 'success', data: result });
});

exports.getMyBookings = catchAsync(async (req, res) => {
  const result = await bookingService.getMyBookings(req.user.id, req.query.page, req.query.limit);
  res.status(200).json({ status: 'success', ...result });
});
