const express = require('express');
const router = express.Router();
const allocationController = require('../controllers/allocationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createAllocation, updateAllocation, returnAllocation } = require('../validators/allocationValidator');

router.use(protect);

router.get('/stats', allocationController.getAllocationStats);

router.get('/overdue', allocationController.getOverdueAllocations);

router.get('/', allocationController.getAllAllocations);

router.get('/:id', allocationController.getAllocationById);

router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createAllocation),
  allocationController.createAllocation
);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateAllocation),
  allocationController.updateAllocation
);

router.post(
  '/:id/return',
  validate(returnAllocation),
  allocationController.returnAllocation
);

module.exports = router;
