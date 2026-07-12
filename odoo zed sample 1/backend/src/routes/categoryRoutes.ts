import { Router } from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getCategories);
router.post('/', authorize('ADMIN', 'ASSET_MANAGER'), createCategory);
router.put('/:id', authorize('ADMIN', 'ASSET_MANAGER'), updateCategory);
router.delete('/:id', authorize('ADMIN', 'ASSET_MANAGER'), deleteCategory);

export default router;
