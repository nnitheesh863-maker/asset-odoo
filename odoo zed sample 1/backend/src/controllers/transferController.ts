import { Response } from 'express';
import { TransferRequest, Asset, AssetAllocation } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog, createNotification } from '../utils/helpers';

export const getTransferRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', status, search = '' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (status) filter.approvalStatus = status;

    const [transfers, total] = await Promise.all([
      TransferRequest.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('requesterId', 'name employeeId')
        .populate('assetId', 'assetTag assetName')
        .populate('currentHolderId', 'name')
        .populate('newHolderId', 'name')
        .populate('approvedById', 'name'),
      TransferRequest.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transfers,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTransferRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, currentHolderId, newHolderId, reason } = req.body;

    if (!assetId || !currentHolderId || !newHolderId || !reason) {
      return res.status(400).json({ success: false, message: 'All fields required' });
    }

    const transfer = await TransferRequest.create({
      requesterId: req.user!.id,
      assetId,
      currentHolderId,
      newHolderId,
      reason,
    });

    const populated = await transfer.populate([
      { path: 'assetId', select: 'assetTag' },
      { path: 'currentHolderId', select: 'name' },
      { path: 'newHolderId', select: 'name' },
    ]);

    await createActivityLog(req.user!.id, 'CREATED', 'TRANSFER_REQUEST', { assetTag: (populated.assetId as any).assetTag });
    await createNotification(newHolderId, 'Transfer Request', `You have a new asset transfer request for ${(populated.assetId as any).assetTag}`, 'TRANSFER_REQUEST');

    res.status(201).json({ success: true, message: 'Transfer request created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveTransfer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(approvalStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid approval status' });
    }

    const transfer = await TransferRequest.findByIdAndUpdate(
      id,
      { approvalStatus, approvedById: req.user!.id },
      { new: true }
    )
      .populate('assetId')
      .populate('requesterId', 'name employeeId')
      .populate('newHolderId', 'name');

    if (!transfer) {
      return res.status(404).json({ success: false, message: 'Transfer request not found' });
    }

    if (approvalStatus === 'APPROVED') {
      await AssetAllocation.updateMany(
        { assetId: transfer.assetId, status: 'ACTIVE' },
        { status: 'RETURNED' }
      );

      await AssetAllocation.create({
        assetId: transfer.assetId,
        employeeId: transfer.newHolderId,
        status: 'ACTIVE',
      });
    }

    await createActivityLog(req.user!.id, approvalStatus === 'APPROVED' ? 'APPROVED' : 'REJECTED', 'TRANSFER_REQUEST', { id });
    await createNotification(transfer.requesterId.toString(), 'Transfer Update', `Your transfer request has been ${approvalStatus.toLowerCase()}`, 'TRANSFER_REQUEST');

    res.json({ success: true, message: `Transfer ${approvalStatus.toLowerCase()}`, data: transfer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
