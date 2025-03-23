const mongoose = require('mongoose');

const DeploymentSchema = new mongoose.Schema({
  provider: {
    type: String,
    enum: ['aws', 'azure', 'netlify', 'none'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'error'],
    default: 'pending'
  },
  logs: {
    type: String,
    default: ''
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  url: {
    type: String
  },
  startedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Deployment', DeploymentSchema);