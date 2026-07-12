const { prisma } = require('../config/database');

const getAdminDashboard = async () => {
  const now = new Date();
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalAssets,
    assetsByStatus,
    totalEmployees,
    totalDepartments,
    pendingTransfers,
    pendingBookings,
    pendingMaintenance,
    recentActivities,
    monthlyAssetGrowth,
    monthlyMaintenanceCosts,
    totalMaintenanceCost,
  ] = await Promise.all([
    prisma.asset.count({ where: { isActive: true } }),
    prisma.asset.groupBy({
      by: ['status'],
      where: { isActive: true },
      _count: { id: true },
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.department.count({ where: { isActive: true } }),
    prisma.transferRequest.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.maintenanceRequest.count({ where: { status: { in: ['REQUESTED', 'SCHEDULED'] } } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatar: true } },
      },
    }),
    prisma.asset.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.maintenanceRequest.findMany({
      where: { actualCost: { not: null }, createdAt: { gte: sixMonthsAgo } },
      select: { actualCost: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.maintenanceRequest.aggregate({
      _sum: { actualCost: true },
      where: { actualCost: { not: null } },
    }),
  ]);

  const statusMap = assetsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {});

  const monthlyAssets = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    monthlyAssets[key] = { month: key, count: 0 };
  }
  monthlyAssetGrowth.forEach((a) => {
    const key = a.createdAt.toISOString().slice(0, 7);
    if (monthlyAssets[key]) monthlyAssets[key].count += 1;
  });

  const monthlyCosts = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const key = d.toISOString().slice(0, 7);
    monthlyCosts[key] = { month: key, cost: 0 };
  }
  monthlyMaintenanceCosts.forEach((m) => {
    const key = m.createdAt.toISOString().slice(0, 7);
    if (monthlyCosts[key]) monthlyCosts[key].cost += Number(m.actualCost);
  });

  return {
    totalAssets,
    assetsByStatus: statusMap,
    totalEmployees,
    totalDepartments,
    pendingRequests: pendingTransfers + pendingBookings + pendingMaintenance,
    pendingTransfers,
    pendingBookings,
    pendingMaintenance,
    monthlyAssetGrowth: Object.values(monthlyAssets),
    monthlyMaintenanceCosts: Object.values(monthlyCosts),
    totalMaintenanceCost: Number(totalMaintenanceCost._sum.actualCost) || 0,
    recentActivities,
  };
};

const getManagerDashboard = async (departmentId) => {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const [department, assetsByStatus, employees, pendingRequests, upcomingMaintenance, totalAllocated] = await Promise.all([
    prisma.department.findUnique({
      where: { id: departmentId },
      select: { id: true, name: true, description: true },
    }),
    prisma.asset.groupBy({
      by: ['status'],
      where: { departmentId, isActive: true },
      _count: { id: true },
    }),
    prisma.user.count({ where: { departmentId, isActive: true } }),
    prisma.maintenanceRequest.count({
      where: { asset: { departmentId }, status: { in: ['REQUESTED', 'SCHEDULED'] } },
    }),
    prisma.maintenanceRequest.findMany({
      where: {
        asset: { departmentId },
        status: { in: ['SCHEDULED'] },
        scheduledDate: { lte: nextWeek },
      },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { scheduledDate: 'asc' },
      take: 10,
    }),
    prisma.assetAllocation.count({
      where: { asset: { departmentId }, isActive: true },
    }),
  ]);

  const totalAssets = await prisma.asset.count({ where: { departmentId, isActive: true } });
  const statusMap = assetsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {});

  return {
    department,
    totalAssets,
    assetsByStatus: statusMap,
    totalEmployees: employees,
    pendingRequests,
    upcomingMaintenance,
    departmentUtilization: totalAssets > 0 ? Number(((totalAllocated / totalAssets) * 100).toFixed(1)) : 0,
  };
};

const getEmployeeDashboard = async (userId) => {
  const [assignedAssets, myBookings, myMaintenanceRequests, unreadNotifications] = await Promise.all([
    prisma.assetAllocation.findMany({
      where: { userId, isActive: true },
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true, location: true, imageUrl: true } },
      },
      orderBy: { allocatedAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { userId },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.maintenanceRequest.findMany({
      where: { requestedById: userId },
      include: {
        asset: { select: { id: true, assetCode: true, name: true } },
        assignedTo: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  const pendingBookings = myBookings.filter((b) => b.status === 'PENDING').length;
  const activeBookings = myBookings.filter((b) => b.status === 'ACTIVE').length;
  const pendingMaintenance = myMaintenanceRequests.filter((m) => ['REQUESTED', 'SCHEDULED'].includes(m.status)).length;

  return {
    assignedAssets,
    assignedAssetsCount: assignedAssets.length,
    myBookings,
    pendingBookings,
    activeBookings,
    myMaintenanceRequests,
    pendingMaintenanceRequests: pendingMaintenance,
    unreadNotifications,
  };
};

module.exports = { getAdminDashboard, getManagerDashboard, getEmployeeDashboard };
