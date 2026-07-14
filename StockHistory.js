const mongoose = require('mongoose');

const StockHistorySchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String },
  type: { type: String, enum: ['In', 'Out', 'Adjustment', 'Return'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String },
  orderId: { type: String },
  performedBy: { type: String, default: 'Admin' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StockHistory', StockHistorySchema);
