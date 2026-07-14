const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, default: '' },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['superadmin', 'staff'], default: 'staff' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', adminSchema);
