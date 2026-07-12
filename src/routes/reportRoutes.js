const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const reportController = require('../controllers/reportController');

router.use(protect);

router.get('/assets', reportController.getAssetReport);
router.get('/maintenance', reportController.getMaintenanceReport);
router.get('/allocations', reportController.getAllocationReport);
router.get('/departments/:id', reportController.getDepartmentReport);
router.get('/costs', authorize('ADMIN', 'MANAGER'), reportController.getCostReport);
router.get('/utilization', reportController.getUtilizationReport);
router.get('/export/excel/:type', reportController.exportExcel);
router.get('/export/pdf/:type', reportController.exportPDF);

module.exports = router;
