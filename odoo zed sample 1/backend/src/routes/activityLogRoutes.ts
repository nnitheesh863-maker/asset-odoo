import { Router } from 'express';
import { getActivityLogs } from '../controllers/activityLogController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', getActivityLogs);

export default router;
