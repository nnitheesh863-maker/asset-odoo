const catchAsync = require('../utils/catchAsync');
const dashboardService = require('../services/dashboardService');

const getAdminDashboard = catchAsync(async (req, res) => {
  const dashboard = await dashboardService.getAdminDashboard();
  res.status(200).json({ status: 'success', data: dashboard });
});

const getManagerDashboard = catchAsync(async (req, res) => {
  const departmentId = req.user.departmentId;
  if (!departmentId) {
    return res.status(400).json({ status: 'fail', message: 'Manager must be assigned to a department' });
  }
  const dashboard = await dashboardService.getManagerDashboard(departmentId);
  res.status(200).json({ status: 'success', data: dashboard });
});

const getEmployeeDashboard = catchAsync(async (req, res) => {
  const dashboard = await dashboardService.getEmployeeDashboard(req.user.id);
  res.status(200).json({ status: 'success', data: dashboard });
});

module.exports = { getAdminDashboard, getManagerDashboard, getEmployeeDashboard };
