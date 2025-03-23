const express = require('express');
const router = express.Router();
const { 
  getSettings, 
  updateSettings, 
  updateSMTP 
} = require('../controllers/settings');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getSettings);
router.put('/', protect, authorize('admin'), updateSettings);
router.put('/smtp', protect, authorize('admin'), updateSMTP);

module.exports = router;
