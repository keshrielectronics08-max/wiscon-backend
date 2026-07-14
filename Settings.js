const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    // singleton pattern — sirf ek hi document hoga is collection mein
    key: { type: String, default: 'site_settings', unique: true },
    supportEmail: { type: String, default: 'support@wiscon.in' },
    supportPhone: { type: String, default: '1800-3094-549' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);
