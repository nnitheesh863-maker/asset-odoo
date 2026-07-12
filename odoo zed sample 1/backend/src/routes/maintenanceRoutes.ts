import { Router } from 'express';
import { getMaintenanceRequests, createMaintenanceRequest, approveMaintenance, updateProgress } from '../controllers/maintenanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getMaintenanceRequests);
router.post('/', createMaintenanceRequest);
router.put('/:id/approve', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), approveMaintenance);
router.put('/:id/progress', authorize('ADMIN', 'ASSET_MANAGER'), updateProgress);

export default router;
