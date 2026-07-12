const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const dashboardController = require('../controllers/dashboardController');

router.use(protect);

router.get('/admin', authorize('ADMIN'), dashboardController.getAdminDashboard);
router.get('/manager', authorize('ADMIN', 'MANAGER'), dashboardController.getManagerDashboard);
router.get('/employee', authorize('EMPLOYEE'), dashboardController.getEmployeeDashboard);

module.exports = router;
