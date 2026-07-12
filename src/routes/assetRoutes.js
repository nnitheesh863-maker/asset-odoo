const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createAsset, updateAsset, searchAssets } = require('../validators/assetValidator');

router.use(protect);

router.get('/stats', assetController.getAssetStats);

router.get(
  '/',
  validate(searchAssets),
  assetController.getAllAssets
);

router.get('/:id', assetController.getAssetById);

router.get('/:id/timeline', assetController.getAssetTimeline);

router.get('/:id/qr-code', assetController.getAssetQRCode);

router.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate(createAsset),
  assetController.createAsset
);

router.put(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate(updateAsset),
  assetController.updateAsset
);

router.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  assetController.deleteAsset
);

module.exports = router;
