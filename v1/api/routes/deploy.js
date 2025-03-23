const express = require('express');
const router = express.Router();
const { 
  deployToAWS, 
  deployToAzure, 
  deployToNetlify,
  getDeploymentHistory,
  getDeploymentStatus
} = require('../controllers/deploy');
const { protect, authorize } = require('../middleware/auth');

router.post('/aws', protect, authorize('admin'), deployToAWS);
router.post('/azure', protect, authorize('admin'), deployToAzure);
router.post('/netlify', protect, authorize('admin'), deployToNetlify);
router.get('/history', protect, getDeploymentHistory);
router.get('/status/:id', protect, getDeploymentStatus);

module.exports = router;