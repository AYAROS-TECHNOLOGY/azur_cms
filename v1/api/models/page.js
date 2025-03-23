const mongoose = require('mongoose');

const PageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Veuillez fournir un titre']
  },
  slug: {
    type: String,
    required: [true, 'Veuillez fournir un slug'],
    unique: true
  },
  description: {
    type: String
  },
  template: {
    type: String,
    default: 'default'
  },
  blocks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  }],
  meta: {
    title: String,
    description: String,
    keywords: String
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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

module.exports = mongoose.model('Page', PageSchema);