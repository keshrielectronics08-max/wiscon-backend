const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  products: [{ type: Number }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Supplier', SupplierSchema);
