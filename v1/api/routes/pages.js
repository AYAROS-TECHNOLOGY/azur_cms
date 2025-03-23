const express = require('express');
const router = express.Router();
const { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage, 
  publishPage,
  duplicatePage
} = require('../controllers/pages');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getPages);
router.get('/:id', protect, getPage);
router.post('/', protect, createPage);
router.put('/:id', protect, updatePage);
router.delete('/:id', protect, authorize('admin'), deletePage);
router.put('/:id/publish', protect, publishPage);
router.post('/:id/duplicate', protect, duplicatePage);

module.exports = router;