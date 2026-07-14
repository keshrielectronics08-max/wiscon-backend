const mongoose = require('mongoose');

const GiftCardSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  balance: { type: Number },
  recipientName: { type: String },
  recipientEmail: { type: String },
  senderName: { type: String },
  message: { type: String },
  isActive: { type: Boolean, default: true },
  isRedeemed: { type: Boolean, default: false },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

GiftCardSchema.pre('save', function (next) {
  if (this.balance === undefined) this.balance = this.amount;
  next();
});

module.exports = mongoose.model('GiftCard', GiftCardSchema);
