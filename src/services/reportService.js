const { prisma } = require('../config/database');
const AppError = require('../utils/AppError');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const getAssetReport = async (filters = {}) => {
  const where = { isActive: true };
  if (filters.departmentId) where.departmentId = filters.departmentId;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.status) where.status = filters.status;

  const [assets, totalCount] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { allocations: true, maintenanceRequests: true, bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.asset.count({ where }),
  ]);

  const statusCounts = await prisma.asset.groupBy({
    by: ['status'],
    where: { isActive: true },
    _count: { id: true },
  });

  const categoryCounts = await prisma.assetCategory.findMany({
    include: { _count: { select: { assets: { where: { isActive: true } } } } },
    orderBy: { name: 'asc' },
  });

  const departmentCounts = await prisma.department.findMany({
    where: { isActive: true },
    include: { _count: { select: { assets: { where: { isActive: true } } } } },
    orderBy: { name: 'asc' },
  });

  return {
    assets,
    summary: {
      totalCount,
      byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
      byCategory: categoryCounts.map((c) => ({ id: c.id, name: c.name, count: c._count.assets })),
      byDepartment: departmentCounts.map((d) => ({ id: d.id, name: d.name, count: d._count.assets })),
    },
  };
};

const getMaintenanceReport = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.departmentId) {
    where.asset = { departmentId: filters.departmentId };
  }
  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const [requests, totalCount] = await Promise.all([
    prisma.maintenanceRequest.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true, department: { select: { name: true } } } },
        requestedBy: { select: { id: true, firstName: true, lastName: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.maintenanceRequest.count({ where }),
  ]);

  const statusCounts = await prisma.maintenanceRequest.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const priorityCounts = await prisma.maintenanceRequest.groupBy({
    by: ['priority'],
    _count: { id: true },
  });

  const costAgg = await prisma.maintenanceRequest.aggregate({
    _sum: { estimatedCost: true, actualCost: true },
    where: { actualCost: { not: null } },
  });

  return {
    requests,
    summary: {
      totalCount,
      byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
      byPriority: priorityCounts.reduce((acc, p) => ({ ...acc, [p.priority]: p._count.id }), {}),
      totalEstimatedCost: Number(costAgg._sum.estimatedCost) || 0,
      totalActualCost: Number(costAgg._sum.actualCost) || 0,
    },
  };
};

const getAllocationReport = async (filters = {}) => {
  const where = {};
  if (filters.departmentId) {
    where.asset = { departmentId: filters.departmentId };
  }
  if (filters.userId) where.userId = filters.userId;
  if (filters.isActive !== undefined) where.isActive = filters.isActive;

  const [allocations, totalCount] = await Promise.all([
    prisma.assetAllocation.findMany({
      where,
      include: {
        asset: { select: { id: true, assetCode: true, name: true, status: true } },
        user: { select: { id: true, firstName: true, lastName: true, department: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.assetAllocation.count({ where }),
  ]);

  const totalAssets = await prisma.asset.count({ where: { isActive: true } });
  const activeAllocations = await prisma.assetAllocation.count({ where: { isActive: true } });
  const utilizationRate = totalAssets > 0 ? ((activeAllocations / totalAssets) * 100).toFixed(1) : 0;

  const overdueAllocations = await prisma.assetAllocation.count({
    where: { isActive: true, dueDate: { lt: new Date() } },
  });

  return {
    allocations,
    summary: {
      totalCount,
      activeAllocations,
      totalAssets,
      utilizationRate: Number(utilizationRate),
      overdueAllocations,
    },
  };
};

const getDepartmentReport = async (departmentId) => {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true, email: true } },
    },
  });
  if (!department) throw new AppError('Department not found', 404);

  const [assets, employees, allocations, maintenanceCount, bookings] = await Promise.all([
    prisma.asset.findMany({
      where: { departmentId, isActive: true },
      include: {
        category: { select: { name: true } },
        _count: { select: { allocations: { where: { isActive: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({
      where: { departmentId, isActive: true },
      select: { id: true, firstName: true, lastName: true, email: true, role: true },
    }),
    prisma.assetAllocation.findMany({
      where: { asset: { departmentId }, isActive: true },
      include: {
        asset: { select: { assetCode: true, name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.maintenanceRequest.count({
      where: { asset: { departmentId } },
    }),
    prisma.booking.findMany({
      where: { asset: { departmentId }, status: { in: ['PENDING', 'ACTIVE'] } },
      include: {
        asset: { select: { assetCode: true, name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
  ]);

  const statusCounts = await prisma.asset.groupBy({
    by: ['status'],
    where: { departmentId, isActive: true },
    _count: { id: true },
  });

  return {
    department,
    assets,
    employees,
    activeAllocations: allocations,
    pendingBookings: bookings,
    summary: {
      totalAssets: assets.length,
      totalEmployees: employees.length,
      activeAllocations: allocations.length,
      maintenanceRequests: maintenanceCount,
      byStatus: statusCounts.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
    },
  };
};

const getCostReport = async (filters = {}) => {
  const purchaseWhere = { isActive: true };
  if (filters.startDate || filters.endDate) {
    purchaseWhere.createdAt = {};
    if (filters.startDate) purchaseWhere.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) purchaseWhere.createdAt.lte = new Date(filters.endDate);
  }

  const maintenanceWhere = {};
  if (filters.startDate || filters.endDate) {
    maintenanceWhere.createdAt = {};
    if (filters.startDate) maintenanceWhere.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) maintenanceWhere.createdAt.lte = new Date(filters.endDate);
  }

  const purchaseCostAgg = await prisma.asset.aggregate({
    _sum: { purchasePrice: true, currentValue: true },
    _count: { id: true },
    where: purchaseWhere,
  });

  const maintenanceCostAgg = await prisma.maintenanceRequest.aggregate({
    _sum: { estimatedCost: true, actualCost: true },
    _count: { id: true },
    where: { ...maintenanceWhere, actualCost: { not: null } },
  });

  const monthlyMaintenance = await prisma.maintenanceRequest.findMany({
    where: { ...maintenanceWhere, actualCost: { not: null } },
    select: { actualCost: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  const monthlyData = {};
  monthlyMaintenance.forEach((m) => {
    const monthKey = m.createdAt.toISOString().slice(0, 7);
    if (!monthlyData[monthKey]) monthlyData[monthKey] = { month: monthKey, totalCost: 0, count: 0 };
    monthlyData[monthKey].totalCost += Number(m.actualCost);
    monthlyData[monthKey].count += 1;
  });

  const categoryCosts = await prisma.asset.groupBy({
    by: ['categoryId'],
    _sum: { purchasePrice: true },
    _count: { id: true },
    where: { isActive: true, purchasePrice: { not: null } },
  });

  const categories = await prisma.assetCategory.findMany({
    select: { id: true, name: true },
  });

  const categoryMap = categories.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {});

  return {
    summary: {
      totalPurchaseCost: Number(purchaseCostAgg._sum.purchasePrice) || 0,
      totalCurrentValue: Number(purchaseCostAgg._sum.currentValue) || 0,
      totalAssets: purchaseCostAgg._count.id,
      totalMaintenanceCost: Number(maintenanceCostAgg._sum.actualCost) || 0,
      totalMaintenanceRequests: maintenanceCostAgg._count.id,
    },
    monthlyMaintenanceCosts: Object.values(monthlyData),
    costsByCategory: categoryCosts.map((c) => ({
      categoryId: c.categoryId,
      categoryName: categoryMap[c.categoryId] || 'Unknown',
      totalCost: Number(c._sum.purchasePrice) || 0,
      count: c._count.id,
    })),
  };
};

const getUtilizationReport = async () => {
  const totalAssets = await prisma.asset.count({ where: { isActive: true } });
  const assetsByStatus = await prisma.asset.groupBy({
    by: ['status'],
    where: { isActive: true },
    _count: { id: true },
  });

  const totalAllocations = await prisma.assetAllocation.count({ where: { isActive: true } });
  const overdueAllocations = await prisma.assetAllocation.count({
    where: { isActive: true, dueDate: { lt: new Date() } },
  });

  const departmentUtilization = await prisma.department.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          assets: { where: { isActive: true } },
        },
      },
    },
  });

  const departmentAllocations = await prisma.assetAllocation.groupBy({
    by: ['assetId'],
    where: { isActive: true },
  });

  const assetDeptMap = await prisma.asset.findMany({
    where: { isActive: true },
    select: { id: true, departmentId: true },
  });

  const deptAssetMap = {};
  assetDeptMap.forEach((a) => {
    if (a.departmentId) {
      if (!deptAssetMap[a.departmentId]) deptAssetMap[a.departmentId] = new Set();
      deptAssetMap[a.departmentId].add(a.id);
    }
  });

  const allocatedAssetIds = new Set(departmentAllocations.map((a) => a.assetId));

  const deptUtilization = departmentUtilization.map((d) => {
    const deptAssets = deptAssetMap[d.id] || new Set();
    const deptAllocated = [...deptAssets].filter((id) => allocatedAssetIds.has(id)).length;
    const total = d._count.assets;
    return {
      departmentId: d.id,
      departmentName: d.name,
      totalAssets: total,
      allocatedAssets: deptAllocated,
      utilizationRate: total > 0 ? Number(((deptAllocated / total) * 100).toFixed(1)) : 0,
    };
  });

  return {
    summary: {
      totalAssets,
      totalAllocations,
      overdueAllocations,
      overallUtilization: totalAssets > 0 ? Number(((totalAllocations / totalAssets) * 100).toFixed(1)) : 0,
      byStatus: assetsByStatus.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
    },
    departmentUtilization: deptUtilization,
  };
};

const exportToExcel = async (data, type) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AssetFlow';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`);

  const columns = getColumnsForType(type);
  sheet.columns = columns;
  sheet.getRow(1).font = { bold: true, size: 12 };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  const rows = getRowsForType(type, data);
  rows.forEach((row) => sheet.addRow(row));

  sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + columns.length)}1` };

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

const exportToPDF = async (data, type) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(`AssetFlow - ${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' });
    doc.moveDown();

    const headers = getPDFHeaders(type);
    const rows = getPDFRows(type, data);

    const colWidths = headers.map(() => 120);
    const startX = 50;
    let startY = doc.y;

    doc.fontSize(10).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
        width: colWidths[i],
        align: 'left',
      });
    });

    doc.font('Helvetica').fontSize(9);
    startY += 20;

    rows.forEach((row, rowIndex) => {
      if (startY > 500) {
        doc.addPage();
        startY = 50;
      }
      row.forEach((cell, i) => {
        doc.text(String(cell || '-'), startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), startY, {
          width: colWidths[i],
          align: 'left',
        });
      });
      startY += 16;
      if (rowIndex % 2 === 0) {
        doc.rect(startX, startY - 16, colWidths.reduce((a, b) => a + b, 0), 16).fill('#f0f0f0').fill('black');
      }
    });

    doc.end();
  });
};

function getColumnsForType(type) {
  switch (type) {
    case 'asset':
      return [
        { header: 'Asset Code', key: 'assetCode', width: 15 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'Category', key: 'category', width: 18 },
        { header: 'Department', key: 'department', width: 18 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Location', key: 'location', width: 20 },
        { header: 'Purchase Price', key: 'purchasePrice', width: 15 },
        { header: 'Current Value', key: 'currentValue', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 18 },
      ];
    case 'maintenance':
      return [
        { header: 'Asset', key: 'asset', width: 20 },
        { header: 'Title', key: 'title', width: 25 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Priority', key: 'priority', width: 12 },
        { header: 'Requested By', key: 'requestedBy', width: 20 },
        { header: 'Assigned To', key: 'assignedTo', width: 20 },
        { header: 'Estimated Cost', key: 'estimatedCost', width: 15 },
        { header: 'Actual Cost', key: 'actualCost', width: 15 },
        { header: 'Created At', key: 'createdAt', width: 18 },
      ];
    case 'allocation':
      return [
        { header: 'Asset Code', key: 'assetCode', width: 15 },
        { header: 'Asset Name', key: 'assetName', width: 25 },
        { header: 'Assigned To', key: 'assignedTo', width: 22 },
        { header: 'Department', key: 'department', width: 18 },
        { header: 'Allocated At', key: 'allocatedAt', width: 18 },
        { header: 'Due Date', key: 'dueDate', width: 15 },
        { header: 'Status', key: 'status', width: 12 },
      ];
    default:
      return [{ header: 'Data', key: 'data', width: 50 }];
  }
}

function getRowsForType(type, data) {
  const items = data.data || data;
  if (!Array.isArray(items)) return [];
  switch (type) {
    case 'asset':
      return items.map((a) => ({
        assetCode: a.assetCode,
        name: a.name,
        category: a.category?.name || '-',
        department: a.department?.name || '-',
        status: a.status,
        location: a.location || '-',
        purchasePrice: a.purchasePrice || 0,
        currentValue: a.currentValue || 0,
        createdAt: a.createdAt,
      }));
    case 'maintenance':
      return items.map((m) => ({
        asset: m.asset?.name || '-',
        title: m.title,
        status: m.status,
        priority: m.priority,
        requestedBy: m.requestedBy ? `${m.requestedBy.firstName} ${m.requestedBy.lastName}` : '-',
        assignedTo: m.assignedTo ? `${m.assignedTo.firstName} ${m.assignedTo.lastName}` : '-',
        estimatedCost: m.estimatedCost || 0,
        actualCost: m.actualCost || 0,
        createdAt: m.createdAt,
      }));
    case 'allocation':
      return items.map((a) => ({
        assetCode: a.asset?.assetCode || '-',
        assetName: a.asset?.name || '-',
        assignedTo: a.user ? `${a.user.firstName} ${a.user.lastName}` : '-',
        department: a.user?.department?.name || '-',
        allocatedAt: a.allocatedAt,
        dueDate: a.dueDate || '-',
        status: a.isActive ? 'Active' : 'Returned',
      }));
    default:
      return items.map((item) => ({ data: JSON.stringify(item) }));
  }
}

function getPDFHeaders(type) {
  switch (type) {
    case 'asset':
      return ['Asset Code', 'Name', 'Category', 'Department', 'Status', 'Location', 'Price'];
    case 'maintenance':
      return ['Asset', 'Title', 'Status', 'Priority', 'Requested By', 'Cost'];
    case 'allocation':
      return ['Asset Code', 'Asset Name', 'Assigned To', 'Department', 'Allocated At', 'Status'];
    default:
      return ['Data'];
  }
}

function getPDFRows(type, data) {
  const items = data.data || data;
  if (!Array.isArray(items)) return [];
  switch (type) {
    case 'asset':
      return items.map((a) => [
        a.assetCode, a.name, a.category?.name || '-',
        a.department?.name || '-', a.status, a.location || '-',
        String(a.purchasePrice || 0),
      ]);
    case 'maintenance':
      return items.map((m) => [
        m.asset?.name || '-', m.title, m.status, m.priority,
        m.requestedBy ? `${m.requestedBy.firstName} ${m.requestedBy.lastName}` : '-',
        String(m.actualCost || m.estimatedCost || 0),
      ]);
    case 'allocation':
      return items.map((a) => [
        a.asset?.assetCode || '-', a.asset?.name || '-',
        a.user ? `${a.user.firstName} ${a.user.lastName}` : '-',
        a.user?.department?.name || '-',
        a.allocatedAt ? new Date(a.allocatedAt).toLocaleDateString() : '-',
        a.isActive ? 'Active' : 'Returned',
      ]);
    default:
      return items.map((item) => [JSON.stringify(item)]);
  }
}

module.exports = {
  getAssetReport,
  getMaintenanceReport,
  getAllocationReport,
  getDepartmentReport,
  getCostReport,
  getUtilizationReport,
  exportToExcel,
  exportToPDF,
};
