import { Response } from 'express';
import { AssetRequest } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog, createNotification } from '../utils/helpers';

export const getAssetRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, assetType, employeeId } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (status) filter.status = status;
    if (assetType) filter.assetType = assetType;
    if (employeeId) filter.employeeId = employeeId;

    const [requests, total] = await Promise.all([
      AssetRequest.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name employeeId email')
        .populate('approvedBy', 'name'),
      AssetRequest.countDocuments(filter),
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

export const createAssetRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { assetType, assetName, justification, priority, specifications } = req.body;

    if (!assetType || !assetName || !justification) {
      return res.status(400).json({ success: false, message: 'Asset type, name and justification required' });
    }

    const request = await AssetRequest.create({
      employeeId: req.user!.id,
      assetType,
      assetName,
      justification,
      priority: priority || 'MEDIUM',
      specifications,
    });

    const populated = await request.populate('employeeId', 'name employeeId');

    await createActivityLog(req.user!.id, 'CREATED', 'ASSET_REQUEST', { assetType, assetName });

    res.status(201).json({ success: true, message: 'Asset request created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAssetRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, approvalNote } = req.body;

    if (!['APPROVED', 'REJECTED', 'FULFILLED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const request = await AssetRequest.findByIdAndUpdate(
      id,
      {
        status,
        approvedBy: req.user!.id,
        approvalNote,
      },
      { new: true }
    )
      .populate('employeeId', 'name employeeId email')
      .populate('approvedBy', 'name');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Asset request not found' });
    }

    await createActivityLog(req.user!.id, `STATUS_${status}`, 'ASSET_REQUEST', { id });
    await createNotification(
      request.employeeId.toString(),
      'Asset Request Update',
      `Your asset request for ${request.assetName} has been ${status.toLowerCase()}`,
      'GENERAL'
    );

    res.json({ success: true, message: `Asset request ${status.toLowerCase()}`, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAssetRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = { employeeId: req.user!.id };
    if (status) filter.status = status;

    const [requests, total] = await Promise.all([
      AssetRequest.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('approvedBy', 'name'),
      AssetRequest.countDocuments(filter),
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
