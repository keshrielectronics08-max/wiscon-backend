const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  userEmail: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category: { type: String, enum: ['Order Issue', 'Payment', 'Delivery', 'Product', 'Refund', 'General'], default: 'General' },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Closed'], default: 'Open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  messages: [{
    sender: { type: String, enum: ['user', 'admin'] },
    senderName: { type: String },
    text: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TicketSchema.pre('save', function (next) {
  if (!this.ticketId) {
    this.ticketId = 'TKT-' + Date.now().toString(36).toUpperCase();
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', TicketSchema);
