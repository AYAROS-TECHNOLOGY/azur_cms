const mongoose = require('mongoose');

const BlockSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['text', 'image', 'video', 'gallery', 'form', 'custom']
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  styles: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  animation: {
    type: String,
    default: 'none'
  },
  position: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  order: {
    type: Number,
    default: 0
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Block', BlockSchema);