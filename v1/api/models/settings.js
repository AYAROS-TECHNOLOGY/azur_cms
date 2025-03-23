const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  siteTitle: {
    type: String,
    required: true
  },
  siteDescription: {
    type: String
  },
  favicon: {
    type: String
  },
  logo: {
    type: String
  },
  smtp: {
    host: String,
    port: Number,
    secure: Boolean,
    user: String,
    pass: String
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  deploymentSettings: {
    provider: {
      type: String,
      enum: ['aws', 'azure', 'netlify', 'none'],
      default: 'none'
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Settings', SettingsSchema);