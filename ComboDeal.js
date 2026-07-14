const mongoose = require('mongoose');

const ComboDealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  products: [{ productId: { type: Number }, name: { type: String } }],
  comboPrice: { type: Number, required: true },
  originalPrice: { type: Number },
  isActive: { type: Boolean, default: true },
  startAt: { type: Date },
  endAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ComboDeal', ComboDealSchema);
