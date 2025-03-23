const express = require('express');
const router = express.Router();
const { 
  getVersions, 
  getVersion, 
  createVersion, 
  restoreVersion 
} = require('../controllers/versions');
const { protect } = require('../middleware/auth');

router.get('/:entityType/:entityId', protect, getVersions);
router.get('/:id', protect, getVersion);
router.post('/', protect, createVersion);
router.post('/:id/restore', protect, restoreVersion);

module.exports = router;