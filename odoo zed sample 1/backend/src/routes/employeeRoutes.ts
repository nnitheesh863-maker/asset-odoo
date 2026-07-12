import { Router } from 'express';
import { getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getEmployees);
router.get('/:id', authorize('ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'), getEmployee);
router.post('/', authorize('ADMIN'), createEmployee);
router.put('/:id', authorize('ADMIN'), updateEmployee);
router.delete('/:id', authorize('ADMIN'), deleteEmployee);

export default router;
