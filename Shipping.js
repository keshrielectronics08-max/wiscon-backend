const mongoose = require('mongoose');

const ShippingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Free', 'Flat Rate', 'Weight Based', 'COD'], default: 'Flat Rate' },
  rate: { type: Number, default: 0 },
  minOrder: { type: Number, default: 0 },
  maxWeight: { type: Number, default: 0 },
  estimatedDays: { type: Number, default: 5 },
  zones: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Shipping', ShippingSchema);
