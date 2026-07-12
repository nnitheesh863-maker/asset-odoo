import { Router } from 'express';
import { getAuditCycles, createAuditCycle, updateAuditCycle } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getAuditCycles);
router.post('/', authorize('ADMIN', 'ASSET_MANAGER'), createAuditCycle);
router.put('/:id', authorize('ADMIN', 'ASSET_MANAGER'), updateAuditCycle);

export default router;
