import { Response } from 'express';
import { MaintenanceRequest, Asset } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog, createNotification } from '../utils/helpers';

export const getMaintenanceRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, priority, approvalStatus } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (status) filter.progressStatus = status;
    if (priority) filter.priority = priority;
    if (approvalStatus) filter.approvalStatus = approvalStatus;

    const [requests, total] = await Promise.all([
      MaintenanceRequest.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('assetId', 'assetTag assetName')
        .populate('employeeId', 'name employeeId'),
      MaintenanceRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: requests,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMaintenanceRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, issue, priority, attachment } = req.body;

    if (!assetId || !issue) {
      return res.status(400).json({ success: false, message: 'Asset and issue description required' });
    }

    const request = await MaintenanceRequest.create({
      assetId,
      employeeId: req.user!.id,
      issue,
      priority: priority || 'MEDIUM',
      attachment,
    });

    const populated = await request.populate([
      { path: 'assetId', select: 'assetTag assetName' },
      { path: 'employeeId', select: 'name' },
    ]);

    await createActivityLog(req.user!.id, 'CREATED', 'MAINTENANCE_REQUEST', { assetTag: (populated.assetId as any).assetTag });

    res.status(201).json({ success: true, message: 'Maintenance request created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveMaintenance = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approvalStatus, technicianId } = req.body;

    const updateData: any = { approvalStatus, technicianId };
    if (approvalStatus === 'APPROVED') {
      updateData.progressStatus = 'IN_PROGRESS';
    }

    const request = await MaintenanceRequest.findByIdAndUpdate(id, updateData, { new: true })
      .populate('assetId', 'assetTag')
      .populate('employeeId', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    if (approvalStatus === 'APPROVED') {
      await Asset.findByIdAndUpdate(request.assetId, { status: 'UNDER_MAINTENANCE' });
    }

    await createActivityLog(req.user!.id, `APPROVED_${approvalStatus}`, 'MAINTENANCE', { id });
    await createNotification(request.employeeId.toString(), 'Maintenance Update', `Your maintenance request has been ${approvalStatus.toLowerCase()}`, 'MAINTENANCE_REQUEST');

    res.json({ success: true, message: 'Maintenance request updated', data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { progressStatus } = req.body;

    const updateData: any = { progressStatus };
    if (progressStatus === 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    const request = await MaintenanceRequest.findByIdAndUpdate(id, updateData, { new: true });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Maintenance request not found' });
    }

    if (progressStatus === 'COMPLETED') {
      await Asset.findByIdAndUpdate(request.assetId, { status: 'AVAILABLE' });
    }

    await createActivityLog(req.user!.id, 'UPDATED_PROGRESS', 'MAINTENANCE', { id, progressStatus });

    res.json({ success: true, message: 'Progress updated', data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
