const express = require('express');
const router = express.Router();
const { 
  getMedia, 
  getMediaFile, 
  uploadMedia, 
  updateMedia, 
  deleteMedia,
  resizeImage 
} = require('../controllers/media');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getMedia);
router.get('/:id', protect, getMediaFile);
router.post('/', protect, upload.single('file'), uploadMedia);
router.put('/:id', protect, updateMedia);
router.delete('/:id', protect, deleteMedia);
router.post('/:id/resize', protect, resizeImage);

module.exports = router;