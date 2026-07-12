import { Router } from 'express';
import { getTransferRequests, createTransferRequest, approveTransfer } from '../controllers/transferController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getTransferRequests);
router.post('/', createTransferRequest);
router.put('/:id/approve', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), approveTransfer);

export default router;
