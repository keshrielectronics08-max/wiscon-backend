const mongoose = require('mongoose');

const FlashSaleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: [{ type: Number }],
  discountType: { type: String, enum: ['Percentage', 'Fixed'], default: 'Percentage' },
  discountValue: { type: Number, required: true },
  startAt: { type: Date, required: true },
  endAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FlashSale', FlashSaleSchema);
