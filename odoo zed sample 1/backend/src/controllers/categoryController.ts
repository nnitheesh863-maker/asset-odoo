import { Response } from 'express';
import { AssetCategory, Asset } from '../models';
import { AuthRequest, PaginationQuery } from '../types';
import { paginate, createActivityLog } from '../utils/helpers';

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10', search = '' } = req.query as PaginationQuery;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const { skip } = paginate(pageNum, limitNum);

    const filter = search
      ? { name: { $regex: search, $options: 'i' } }
      : {};

    const [categories, total] = await Promise.all([
      AssetCategory.find(filter)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 }),
      AssetCategory.countDocuments(filter),
    ]);

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const assets = await Asset.countDocuments({ categoryId: cat._id });
        return { ...cat.toObject(), _count: { assets } };
      })
    );

    res.json({
      success: true,
      data: categoriesWithCount,
      pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, customFields } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Category name required' });

    const existing = await AssetCategory.findOne({ name });
    if (existing) return res.status(409).json({ success: false, message: 'Category already exists' });

    const category = await AssetCategory.create({ name, description, customFields });

    await createActivityLog(req.user!.id, 'CREATED', 'ASSET_CATEGORY', { name });

    res.status(201).json({ success: true, message: 'Category created', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, customFields } = req.body;

    const category = await AssetCategory.findByIdAndUpdate(
      id,
      { name, description, customFields },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await createActivityLog(req.user!.id, 'UPDATED', 'ASSET_CATEGORY', { name: category.name });

    res.json({ success: true, message: 'Category updated', data: category });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const hasAssets = await Asset.countDocuments({ categoryId: id });
    if (hasAssets > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete category with assets' });
    }

    await AssetCategory.findByIdAndDelete(id);
    await createActivityLog(req.user!.id, 'DELETED', 'ASSET_CATEGORY', { id });

    res.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
