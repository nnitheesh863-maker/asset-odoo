import { Response } from 'express';
import { Asset, AssetAllocation, TransferRequest, MaintenanceRequest, Booking } from '../models';
import { AuthRequest, AssetFilterQuery } from '../types';
import { paginate, generateAssetTag, createActivityLog } from '../utils/helpers';

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '', status, condition, categoryId, departmentId, location } = req.query as AssetFilterQuery;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter: any = {};
    if (search) {
      filter.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { assetName: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
      ];
    }
    if (status) filter.status = status;
    if (condition) filter.condition = condition;
    if (categoryId) filter.categoryId = categoryId;
    if (departmentId) filter.departmentId = departmentId;
    if (location) filter.location = { $regex: location, $options: 'i' };

    const [assets, total] = await Promise.all([
      Asset.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('categoryId', 'name')
        .populate('departmentId', 'name'),
      Asset.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: assets,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findById(id)
      .populate('categoryId')
      .populate('departmentId', 'name');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const [allocations, maintenanceRequests, transferRequests, bookings] = await Promise.all([
      AssetAllocation.find({ assetId: id })
        .sort({ allocatedDate: -1 })
        .limit(10)
        .populate('employeeId', 'name employeeId'),
      MaintenanceRequest.find({ assetId: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('employeeId', 'name'),
      TransferRequest.find({ assetId: id })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('requesterId', 'name')
        .populate('currentHolderId', 'name')
        .populate('newHolderId', 'name'),
      Booking.find({ resourceId: id })
        .sort({ startTime: -1 })
        .limit(5)
        .populate('employeeId', 'name'),
    ]);

    res.json({
      success: true,
      data: {
        ...asset.toObject(),
        allocations,
        maintenanceRequests,
        transferRequests,
        bookings,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetName, serialNumber, categoryId, acquisitionDate, acquisitionCost, warranty, location, condition, sharedBookable, departmentId, image, documents } = req.body;

    if (!assetName || !serialNumber || !categoryId || !acquisitionDate || !acquisitionCost || !location) {
      return res.status(400).json({ success: false, message: 'Required fields missing' });
    }

    const existingSerial = await Asset.findOne({ serialNumber });
    if (existingSerial) {
      return res.status(409).json({ success: false, message: 'Serial number already exists' });
    }

    const assetTag = await generateAssetTag();

    const asset = await Asset.create({
      assetTag,
      assetName,
      serialNumber,
      categoryId,
      acquisitionDate: new Date(acquisitionDate),
      acquisitionCost: parseFloat(acquisitionCost),
      warranty,
      location,
      condition: condition || 'NEW',
      status: 'AVAILABLE',
      sharedBookable: sharedBookable || false,
      departmentId,
      image,
      documents,
    });

    const populated = await asset.populate([
      { path: 'categoryId', select: 'name' },
      { path: 'departmentId', select: 'name' },
    ]);

    await createActivityLog(req.user!.id, 'CREATED', 'ASSET', { assetTag, assetName });

    res.status(201).json({ success: true, message: 'Asset created', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.acquisitionDate) updateData.acquisitionDate = new Date(updateData.acquisitionDate);
    if (updateData.acquisitionCost) updateData.acquisitionCost = parseFloat(updateData.acquisitionCost);

    const asset = await Asset.findByIdAndUpdate(id, updateData, { new: true })
      .populate('categoryId', 'name')
      .populate('departmentId', 'name');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await createActivityLog(req.user!.id, 'UPDATED', 'ASSET', { assetTag: asset.assetTag });

    res.json({ success: true, message: 'Asset updated', data: asset });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const activeAllocation = await AssetAllocation.findOne({
      assetId: id,
      status: 'ACTIVE',
    });
    if (activeAllocation) {
      return res.status(400).json({ success: false, message: 'Cannot delete asset that is currently allocated' });
    }

    await Asset.findByIdAndDelete(id);
    await createActivityLog(req.user!.id, 'DELETED', 'ASSET', { id });

    res.json({ success: true, message: 'Asset deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const allocateAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { assetId, employeeId, departmentId, expectedReturnDate, notes } = req.body;

    const asset = await Asset.findById(assetId);
    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });
    if (asset.status !== 'AVAILABLE') {
      return res.status(400).json({ success: false, message: 'Asset is not available for allocation' });
    }

    const existingAllocation = await AssetAllocation.findOne({
      assetId,
      status: 'ACTIVE',
    });
    if (existingAllocation) {
      return res.status(400).json({ success: false, message: 'Asset already allocated' });
    }

    await AssetAllocation.create({
      assetId,
      employeeId,
      departmentId,
      expectedReturnDate: expectedReturnDate ? new Date(expectedReturnDate) : undefined,
      notes,
      status: 'ACTIVE',
    });

    await Asset.findByIdAndUpdate(assetId, { status: 'ALLOCATED' });
    await createActivityLog(req.user!.id, 'ALLOCATED', 'ASSET', { assetTag: asset.assetTag });

    const populated = await AssetAllocation.findOne({ assetId, status: 'ACTIVE' })
      .populate('assetId', 'assetTag assetName')
      .populate('employeeId', 'name employeeId');

    res.status(201).json({ success: true, message: 'Asset allocated', data: populated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const returnAsset = async (req: AuthRequest, res: Response) => {
  try {
    const { allocationId } = req.params;

    const allocation = await AssetAllocation.findById(allocationId);
    if (!allocation) return res.status(404).json({ success: false, message: 'Allocation not found' });
    if (allocation.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Allocation is not active' });
    }

    const updatedAllocation = await AssetAllocation.findByIdAndUpdate(
      allocationId,
      { returnedDate: new Date(), status: 'RETURNED' },
      { new: true }
    );

    await Asset.findByIdAndUpdate(allocation.assetId, { status: 'AVAILABLE' });
    await createActivityLog(req.user!.id, 'RETURNED', 'ASSET', { allocationId });

    res.json({ success: true, message: 'Asset returned', data: updatedAllocation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAssetHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [allocations, transfers, maintenance, bookings] = await Promise.all([
      AssetAllocation.find({ assetId: id })
        .sort({ allocatedDate: -1 })
        .populate('employeeId', 'name employeeId'),
      TransferRequest.find({ assetId: id })
        .sort({ createdAt: -1 })
        .populate('requesterId', 'name')
        .populate('currentHolderId', 'name')
        .populate('newHolderId', 'name'),
      MaintenanceRequest.find({ assetId: id })
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name'),
      Booking.find({ resourceId: id })
        .sort({ startTime: -1 })
        .populate('employeeId', 'name'),
    ]);

    res.json({ success: true, data: { allocations, transfers, maintenance, bookings } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
