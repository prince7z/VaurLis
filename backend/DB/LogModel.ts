import mongoose from 'mongoose';

const LogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  level: {
    type: String,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info',
    index: true
  },
  type: {
    type: String,
    enum: ['request', 'cors_violation', 'error', 'system'],
    default: 'request',
    index: true
  },
  // Request details
  method: String,
  url: String,
  status: Number,
  responseTime: Number,
  ip: String,
  userAgent: String,
  referer: String,
  
  // User details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  username: String,
  userEmail: String,
  userImg: String,
  
  // Request data
  query: mongoose.Schema.Types.Mixed,
  body: mongoose.Schema.Types.Mixed,
  
  // Browser/Device info
  browser: String,
  os: String,
  device: String,
  language: String,
  
  // Error details (for error logs)
  errorMessage: String,
  errorStack: String,
  
  // CORS violation details
  corsDetails: mongoose.Schema.Types.Mixed,
  
  // General message
  message: String,
  
  // Additional metadata
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true,
  // Auto-delete logs older than 30 days
  expireAfterSeconds: 30 * 24 * 60 * 60
});

// Indexes for efficient querying
LogSchema.index({ timestamp: -1 });
LogSchema.index({ level: 1, timestamp: -1 });
LogSchema.index({ type: 1, timestamp: -1 });
LogSchema.index({ userId: 1, timestamp: -1 });
LogSchema.index({ status: 1, timestamp: -1 });

export const Log = mongoose.model('Log', LogSchema);
