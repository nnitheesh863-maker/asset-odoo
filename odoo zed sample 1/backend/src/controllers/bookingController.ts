import { Response } from 'express';
import { Booking, Asset } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog } from '../utils/helpers';

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, resourceId } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (status) filter.status = status;
    if (resourceId) filter.resourceId = resourceId;

    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ startTime: -1 })
        .populate('resourceId', 'assetTag assetName')
        .populate('employeeId', 'name employeeId'),
      Booking.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: bookings,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { resourceId, startTime, endTime } = req.body;

    if (!resourceId || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Resource, start and end time required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const overlapping = await Booking.findOne({
      resourceId,
      status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    });

    if (overlapping) {
      return res.status(409).json({ success: false, message: 'Time slot overlaps with existing booking' });
    }

    const asset = await Asset.findById(resourceId);
    if (!asset) return res.status(404).json({ success: false, message: 'Resource not found' });
    if (!asset.sharedBookable) {
      return res.status(400).json({ success: false, message: 'Asset is not bookable' });
    }

    const booking = await Booking.create({
      resourceId,
      employeeId: req.user!.id,
      startTime: start,
      endTime: end,
      status: 'PENDING',
    });

    const populated = await booking.populate([
      { path: 'resourceId', select: 'assetTag assetName' },
      { path: 'employeeId', select: 'name' },
    ]);

    await createActivityLog(req.user!.id, 'CREATED', 'BOOKING', { resource: asset.assetTag });

    res.status(201).json({ success: true, message: 'Booking created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      .populate('resourceId', 'assetTag')
      .populate('employeeId', 'name');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await createActivityLog(req.user!.id, `STATUS_${status}`, 'BOOKING', { id });

    res.json({ success: true, message: 'Booking updated', data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(id, { status: 'CANCELLED' }, { new: true });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    await createActivityLog(req.user!.id, 'CANCELLED', 'BOOKING', { id });

    res.json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
