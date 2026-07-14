const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', trim: true },
    comment: { type: String, required: true, trim: true },
    verified: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
