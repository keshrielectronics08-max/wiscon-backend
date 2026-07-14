const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  image: { type: String },
  link: { type: String },
  position: { type: String, enum: ['Homepage', 'All Products', 'Category Page', 'Popup', 'Footer', 'Innovation'], default: 'Homepage' },
  type: { type: String, enum: ['Banner', 'Slider', 'Popup', 'Newsletter'], default: 'Slider' },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startsAt: { type: Date },
  endsAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Banner', BannerSchema);
