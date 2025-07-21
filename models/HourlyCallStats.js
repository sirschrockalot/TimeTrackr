const mongoose = require('mongoose');

const hourlyCallStatsSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String },
  timestamp: { type: Date, required: true },
  totalDials: { type: Number, default: 0 },
  totalTalkTimeMinutes: { type: Number, default: 0 },
  callIds: { type: [String], default: [] },
  source: { type: String, default: 'aircall' },
  createdAt: { type: Date, default: Date.now, expires: '13m' }
});

hourlyCallStatsSchema.index({ userId: 1, timestamp: 1 }, { unique: true });

module.exports = mongoose.models.HourlyCallStats || mongoose.model('HourlyCallStats', hourlyCallStatsSchema); 