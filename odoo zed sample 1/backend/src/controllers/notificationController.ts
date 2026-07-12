import { Response } from 'express';
import { Notification } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate } from '../utils/helpers';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query as PaginationQuery;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId: req.user!.id })
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      Notification.countDocuments({ userId: req.user!.id }),
      Notification.countDocuments({ userId: req.user!.id, readStatus: false }),
    ]);

    res.json({
      success: true,
      data: { notifications, unreadCount },
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { readStatus: true });
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await Notification.updateMany(
      { userId: req.user!.id, readStatus: false },
      { readStatus: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
