import { Response } from 'express';
import { ActivityLog } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate } from '../utils/helpers';

export const getActivityLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', module, action } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (module) filter.module = module;
    if (action) filter.action = { $regex: action, $options: 'i' };

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ timestamp: -1 })
        .populate('userId', 'name employeeId'),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
