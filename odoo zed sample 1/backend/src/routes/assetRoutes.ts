import { Router } from 'express';
import { getAssets, getAsset, createAsset, updateAsset, deleteAsset, allocateAsset, returnAsset, getAssetHistory } from '../controllers/assetController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAssets);
router.get('/:id', getAsset);
router.get('/:id/history', getAssetHistory);
router.post('/', authorize('ADMIN', 'ASSET_MANAGER'), createAsset);
router.put('/:id', authorize('ADMIN', 'ASSET_MANAGER'), updateAsset);
router.delete('/:id', authorize('ADMIN', 'ASSET_MANAGER'), deleteAsset);
router.post('/allocate', authorize('ADMIN', 'ASSET_MANAGER'), allocateAsset);
router.put('/return/:allocationId', authorize('ADMIN', 'ASSET_MANAGER', 'EMPLOYEE'), returnAsset);

export default router;
