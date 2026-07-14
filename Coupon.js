const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Percentage', 'Fixed', 'Free Shipping', 'Buy X Get Y'], default: 'Percentage' },
  value: { type: Number, required: true },
  minOrder: { type: Number, default: 0 },
  maxDiscount: { type: Number },
  usageLimit: { type: Number, default: 0 },
  usedCount: { type: Number, default: 0 },
  applicableProducts: [{ type: Number }],
  applicableCategories: [{ type: String }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Coupon', CouponSchema);
