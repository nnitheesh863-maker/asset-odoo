import { Router } from 'express';
import {
  getDashboardStats,
  getAnalytics,
  getManagerDashboard,
  getDepartmentDashboard,
  getEmployeeDashboard,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// General dashboard (used by Admin)
router.get('/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// Role-specific dashboards
router.get('/manager', getManagerDashboard);
router.get('/department', getDepartmentDashboard);
router.get('/employee', getEmployeeDashboard);

export default router;
