const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  orderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  items: [{
    productId: { type: Number },
    name: { type: String },
    qty: { type: Number },
    price: { type: Number },
    gst: { type: Number, default: 18 },
    total: { type: Number },
  }],
  subtotal: { type: Number },
  gstAmount: { type: Number, default: 0 },
  total: { type: Number },
  billingAddress: { type: String },
  shippingAddress: { type: String },
  paymentMethod: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Partial', 'Overdue'], default: 'Pending' },
  status: { type: String, enum: ['Draft', 'Sent', 'Paid', 'Cancelled'], default: 'Draft' },
  dueDate: { type: Date },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

InvoiceSchema.pre('save', function (next) {
  if (!this.invoiceNumber) {
    this.invoiceNumber = 'INV-' + Date.now().toString(36).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
