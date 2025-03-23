const express = require('express');
const router = express.Router();
const { 
  getBlocks, 
  getBlock, 
  createBlock, 
  updateBlock, 
  deleteBlock, 
  updateBlockPosition 
} = require('../controllers/blocks');
const { protect } = require('../middleware/auth');

router.get('/', protect, getBlocks);
router.get('/:id', protect, getBlock);
router.post('/', protect, createBlock);
router.put('/:id', protect, updateBlock);
router.delete('/:id', protect, deleteBlock);
router.put('/:id/position', protect, updateBlockPosition);

module.exports = router;