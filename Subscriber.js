const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  isActive: { type: Boolean, default: true },
  source: { type: String, default: 'Website' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Subscriber', SubscriberSchema);
