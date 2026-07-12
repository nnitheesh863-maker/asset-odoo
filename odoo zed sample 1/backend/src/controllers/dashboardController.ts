import { Response } from 'express';
import { Asset, AssetAllocation, Booking, MaintenanceRequest, TransferRequest, Employee, Department, AssetCategory, ActivityLog, Notification } from '../models';
import { AuthRequest } from '../types';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      totalAssets,
      availableAssets,
      allocatedAssets,
      underMaintenance,
      lostAssets,
      activeBookings,
      pendingMaintenance,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
      totalEmployees,
      totalDepartments,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'AVAILABLE' }),
      Asset.countDocuments({ status: 'ALLOCATED' }),
      Asset.countDocuments({ status: 'UNDER_MAINTENANCE' }),
      Asset.countDocuments({ status: 'LOST' }),
      Booking.countDocuments({ status: { $in: ['CONFIRMED', 'ACTIVE'] } }),
      MaintenanceRequest.countDocuments({ approvalStatus: 'PENDING' }),
      TransferRequest.countDocuments({ approvalStatus: 'PENDING' }),
      AssetAllocation.countDocuments({
        status: 'ACTIVE',
        expectedReturnDate: { $gte: now, $lte: weekFromNow },
      }),
      AssetAllocation.countDocuments({
        status: 'ACTIVE',
        expectedReturnDate: { $lt: now },
      }),
      Employee.countDocuments({ status: 'ACTIVE' }),
      Department.countDocuments({ status: 'ACTIVE' }),
    ]);

    const [departmentDistribution, categoryDistribution, recentActivity, recentNotifications] = await Promise.all([
      Department.aggregate([
        { $match: { status: 'ACTIVE' } },
        {
          $lookup: {
            from: 'assets',
            localField: '_id',
            foreignField: 'departmentId',
            as: 'assets',
          },
        },
        {
          $project: {
            name: 1,
            count: { $size: '$assets' },
          },
        },
      ]),
      AssetCategory.aggregate([
        {
          $lookup: {
            from: 'assets',
            localField: '_id',
            foreignField: 'categoryId',
            as: 'assets',
          },
        },
        {
          $project: {
            name: 1,
            count: { $size: '$assets' },
          },
        },
      ]),
      ActivityLog.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('userId', 'name'),
      Notification.find({ userId: req.user!.id })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalAssets,
          availableAssets,
          allocatedAssets,
          underMaintenance,
          lostAssets,
          activeBookings,
          pendingMaintenance,
          pendingTransfers,
          upcomingReturns,
          overdueReturns,
          totalEmployees,
          totalDepartments,
        },
        departmentDistribution,
        categoryDistribution,
        recentActivity,
        recentNotifications,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getManagerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalAssets,
      availableAssets,
      underMaintenance,
      pendingMaintenance,
      pendingTransfers,
      overdueReturns,
      conditionDistribution,
      recentAssets,
    ] = await Promise.all([
      Asset.countDocuments(),
      Asset.countDocuments({ status: 'AVAILABLE' }),
      Asset.countDocuments({ status: 'UNDER_MAINTENANCE' }),
      MaintenanceRequest.countDocuments({ approvalStatus: 'PENDING' }),
      TransferRequest.countDocuments({ approvalStatus: 'PENDING' }),
      AssetAllocation.countDocuments({ status: 'ACTIVE', expectedReturnDate: { $lt: new Date() } }),
      Asset.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
      ]),
      Asset.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('categoryId', 'name'),
    ]);

    const categoryDistribution = await AssetCategory.aggregate([
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: 'categoryId',
          as: 'assets',
        },
      },
      {
        $project: {
          name: 1,
          count: { $size: '$assets' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        stats: { totalAssets, availableAssets, underMaintenance, pendingMaintenance, pendingTransfers, overdueReturns },
        conditionDistribution: conditionDistribution.map(c => ({ name: c._id, count: c.count })),
        categoryDistribution,
        recentAssets,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartmentDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const employee = await Employee.findById(req.user!.id).select('departmentId');
    const deptId = employee?.departmentId;

    if (!deptId) {
      return res.json({ success: true, data: { stats: {}, deptAssets: [], pendingTransfers: [], bookings: [] } });
    }

    const [deptAssets, pendingTransfers, bookings, deptEmployees, allocatedAssets] = await Promise.all([
      Asset.find({ departmentId: deptId })
        .sort({ createdAt: -1 })
        .populate('categoryId', 'name'),
      TransferRequest.find({ approvalStatus: 'PENDING' })
        .sort({ createdAt: -1 })
        .populate('requesterId', 'name employeeId')
        .populate('assetId', 'assetTag assetName')
        .populate('currentHolderId', 'name')
        .populate('newHolderId', 'name'),
      Booking.find()
        .sort({ startTime: -1 })
        .limit(10)
        .populate('resourceId', 'assetTag assetName')
        .populate('employeeId', 'name'),
      Employee.countDocuments({ departmentId: deptId, status: 'ACTIVE' }),
      AssetAllocation.countDocuments({ departmentId: deptId, status: 'ACTIVE' }),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          departmentAssets: deptAssets.length,
          departmentEmployees: deptEmployees,
          pendingTransfers: pendingTransfers.length,
          allocatedAssets,
        },
        deptAssets,
        pendingTransfers,
        bookings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const [allocations, bookings, maintenance, transfers, notifications] = await Promise.all([
      AssetAllocation.find({ employeeId: userId, status: 'ACTIVE' })
        .sort({ allocatedDate: -1 })
        .populate('assetId', 'assetTag assetName status location condition'),
      Booking.find({ employeeId: userId })
        .sort({ startTime: -1 })
        .limit(10)
        .populate('resourceId', 'assetTag assetName'),
      MaintenanceRequest.find({ employeeId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('assetId', 'assetTag assetName'),
      TransferRequest.find({ requesterId: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('assetId', 'assetTag assetName')
        .populate('currentHolderId', 'name')
        .populate('newHolderId', 'name'),
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const unreadCount = await Notification.countDocuments({
      userId,
      readStatus: false,
    });

    res.json({
      success: true,
      data: {
        myAssets: allocations.map(a => a.assetId),
        bookings,
        maintenance,
        transfers,
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const [lifecycleStats, maintenanceByPriority, departmentAllocation, bookingStats] = await Promise.all([
      Asset.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      MaintenanceRequest.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),
      AssetAllocation.aggregate([
        { $match: { status: 'ACTIVE' } },
        { $group: { _id: '$departmentId', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const deptNames = await Department.find().select('name').lean();
    const deptMap = new Map(deptNames.map(d => [d._id.toString(), d.name]));

    res.json({
      success: true,
      data: {
        lifecycleStats: lifecycleStats.map(s => ({ status: s._id, _count: s.count })),
        maintenanceByPriority: maintenanceByPriority.map(s => ({ priority: s._id, _count: s.count })),
        departmentAllocation: departmentAllocation.map(d => ({
          department: deptMap.get(d._id?.toString() || '') || 'Unassigned',
          count: d.count,
        })),
        bookingStats: bookingStats.map(s => ({ status: s._id, _count: s.count })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
