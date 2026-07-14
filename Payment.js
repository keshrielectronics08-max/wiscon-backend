const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  orderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Failed', 'Refunded'], default: 'Pending' },
  transactionId: { type: String },
  gateway: { type: String, default: 'Razorpay' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

PaymentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);
