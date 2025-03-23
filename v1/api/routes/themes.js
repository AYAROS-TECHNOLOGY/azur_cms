const express = require('express');
const router = express.Router();
const { 
  getThemes, 
  getTheme, 
  createTheme, 
  updateTheme, 
  deleteTheme, 
  activateTheme,
  exportTheme,
  importTheme
} = require('../controllers/themes');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', protect, getThemes);
router.get('/:id', protect, getTheme);
router.post('/', protect, authorize('admin'), createTheme);
router.put('/:id', protect, updateTheme);
router.delete('/:id', protect, authorize('admin'), deleteTheme);
router.put('/:id/activate', protect, authorize('admin'), activateTheme);
router.get('/:id/export', protect, exportTheme);
router.post('/import', protect, authorize('admin'), upload.single('file'), importTheme);

module.exports = router;