const catchAsync = require('../utils/catchAsync');
const reportService = require('../services/reportService');
const { prisma } = require('../config/database');

const getAssetReport = catchAsync(async (req, res) => {
  const report = await reportService.getAssetReport(req.query);
  res.status(200).json({ status: 'success', ...report });
});

const getMaintenanceReport = catchAsync(async (req, res) => {
  const report = await reportService.getMaintenanceReport(req.query);
  res.status(200).json({ status: 'success', ...report });
});

const getAllocationReport = catchAsync(async (req, res) => {
  const report = await reportService.getAllocationReport(req.query);
  res.status(200).json({ status: 'success', ...report });
});

const getDepartmentReport = catchAsync(async (req, res) => {
  const report = await reportService.getDepartmentReport(req.params.id);
  res.status(200).json({ status: 'success', ...report });
});

const getCostReport = catchAsync(async (req, res) => {
  const report = await reportService.getCostReport(req.query);
  res.status(200).json({ status: 'success', ...report });
});

const getUtilizationReport = catchAsync(async (req, res) => {
  const report = await reportService.getUtilizationReport();
  res.status(200).json({ status: 'success', ...report });
});

const exportExcel = catchAsync(async (req, res) => {
  const { type } = req.params;
  let data;
  switch (type) {
    case 'asset':
      data = await reportService.getAssetReport(req.query);
      break;
    case 'maintenance':
      data = await reportService.getMaintenanceReport(req.query);
      break;
    case 'allocation':
      data = await reportService.getAllocationReport(req.query);
      break;
    default:
      data = { data: [] };
  }

  const buffer = await reportService.exportToExcel(data, type);

  await prisma.report.create({
    data: {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report (Excel)`,
      type: `excel_${type}`,
      parameters: req.query,
      createdById: req.user.id,
    },
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${type}_report.xlsx`);
  res.send(buffer);
});

const exportPDF = catchAsync(async (req, res) => {
  const { type } = req.params;
  let data;
  switch (type) {
    case 'asset':
      data = await reportService.getAssetReport(req.query);
      break;
    case 'maintenance':
      data = await reportService.getMaintenanceReport(req.query);
      break;
    case 'allocation':
      data = await reportService.getAllocationReport(req.query);
      break;
    default:
      data = { data: [] };
  }

  const buffer = await reportService.exportToPDF(data, type);

  await prisma.report.create({
    data: {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report (PDF)`,
      type: `pdf_${type}`,
      parameters: req.query,
      createdById: req.user.id,
    },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${type}_report.pdf`);
  res.send(buffer);
});

module.exports = {
  getAssetReport,
  getMaintenanceReport,
  getAllocationReport,
  getDepartmentReport,
  getCostReport,
  getUtilizationReport,
  exportExcel,
  exportPDF,
};
