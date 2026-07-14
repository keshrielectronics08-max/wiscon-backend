const mongoose = require('mongoose');

const socialLinkSchema = new mongoose.Schema(
  {
    platform: { type: String, required: true, unique: true, enum: ['facebook','instagram','youtube','twitter','whatsapp','linkedin','telegram','pinterest','other'] },
    url: { type: String, default: '' },
    label: { type: String, default: '' },
    icon: { type: String, default: '' },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SocialLink', socialLinkSchema);
