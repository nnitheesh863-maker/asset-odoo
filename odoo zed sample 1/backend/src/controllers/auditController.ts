import { Response } from 'express';
import { AuditCycle } from '../models';
import { AuthRequest } from '../types';
import { paginate, createActivityLog } from '../utils/helpers';

export const getAuditCycles = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const [cycles, total] = await Promise.all([
      AuditCycle.find()
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('departmentId', 'name')
        .populate('auditorIds', 'name employeeId'),
      AuditCycle.countDocuments(),
    ]);

    res.json({
      success: true,
      data: cycles,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuditCycle = async (req: AuthRequest, res: Response) => {
  try {
    const { cycleName, departmentId, location, auditorIds, startDate, endDate } = req.body;

    const cycle = await AuditCycle.create({
      cycleName,
      departmentId,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      auditorIds: auditorIds || [],
    });

    const populated = await cycle.populate([
      { path: 'departmentId', select: 'name' },
      { path: 'auditorIds', select: 'name employeeId' },
    ]);

    await createActivityLog(req.user!.id, 'CREATED', 'AUDIT_CYCLE', { cycleName });

    res.status(201).json({ success: true, message: 'Audit cycle created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAuditCycle = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { cycleName, departmentId, location, auditorIds, startDate, endDate, assetVerification, discrepancyReport } = req.body;

    const data: any = {};
    if (cycleName) data.cycleName = cycleName;
    if (departmentId) data.departmentId = departmentId;
    if (location) data.location = location;
    if (startDate) data.startDate = new Date(startDate);
    if (endDate) data.endDate = new Date(endDate);
    if (assetVerification) data.assetVerification = assetVerification;
    if (discrepancyReport) data.discrepancyReport = discrepancyReport;
    if (auditorIds) data.auditorIds = auditorIds;

    const cycle = await AuditCycle.findByIdAndUpdate(id, data, { new: true })
      .populate('departmentId', 'name')
      .populate('auditorIds', 'name employeeId');

    if (!cycle) {
      return res.status(404).json({ success: false, message: 'Audit cycle not found' });
    }

    await createActivityLog(req.user!.id, 'UPDATED', 'AUDIT_CYCLE', { cycleName: cycle.cycleName });

    res.json({ success: true, message: 'Audit cycle updated', data: cycle });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
