const mongoose = require('mongoose');

const RefundSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  productId: { type: Number },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  amount: { type: Number, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected', 'Completed'], default: 'Pending' },
  refundMethod: { type: String, enum: ['Original Payment', 'Bank Transfer', 'Store Credit'], default: 'Original Payment' },
  adminNotes: { type: String },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  processedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RefundSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Refund', RefundSchema);
