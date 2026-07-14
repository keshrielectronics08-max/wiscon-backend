const mongoose = require('mongoose');

const shiprocketConfigSchema = new mongoose.Schema(
  {
    email: { type: String, default: '' },
    password: { type: String, default: '' },
    channelId: { type: String, default: '' },
    pickupLocation: { type: String, default: 'home' },
    token: { type: String, default: '' },
    tokenExpiry: { type: Date, default: null },
    enabled: { type: Boolean, default: false },
    autoTrack: { type: Boolean, default: true },
    notifyCustomer: { type: Boolean, default: true },
    webhookSecret: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ShiprocketConfig', shiprocketConfigSchema);
