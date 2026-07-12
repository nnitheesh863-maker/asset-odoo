const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const auditValidator = require('../validators/auditValidator');
const auditController = require('../controllers/auditController');

router.use(protect);

router.get('/stats', auditController.getAuditStats);

router.post('/cycles', authorize('ADMIN', 'MANAGER'), auditValidator.createAuditCycle, auditController.createCycle);
router.get('/cycles', auditController.getAllCycles);
router.get('/cycles/:id', auditController.getCycleById);
router.post('/cycles/:id/complete', authorize('ADMIN', 'MANAGER'), auditController.completeCycle);
router.get('/cycles/:id/discrepancies', auditController.getDiscrepancies);

router.post('/items', authorize('ADMIN', 'MANAGER'), auditValidator.createAuditItem, auditController.createAuditItem);
router.put('/items/:id', auditValidator.updateAuditItem, auditController.updateAuditItem);

module.exports = router;
