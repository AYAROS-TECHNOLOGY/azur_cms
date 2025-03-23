const mongoose = require('mongoose');

const VersionSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
    enum: ['page', 'theme', 'settings']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  comment: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Version', VersionSchema);