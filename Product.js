const mongoose = require('mongoose');

const specSchema = new mongoose.Schema({ label: String, value: String }, { _id: false });
const dimensionsSchema = new mongoose.Schema(
  { length: { type: Number, default: 0 }, width: { type: Number, default: 0 }, height: { type: Number, default: 0 } },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    // legacy numeric id rakha hai taaki purani website ka code chalta rahe
    id: { type: Number, required: true, unique: true },

    // ===== 1. Basic Information =====
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: 'Wiscon', trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, default: '', trim: true },
    status: { type: String, enum: ['draft', 'active', 'inactive'], default: 'draft' },

    // ===== 2. Product Images =====
    mainImage: { type: String, default: '' },
    images: { type: [String], default: [] }, // gallery images

    // ===== 3. Pricing =====
    mrp: { type: Number, default: 0, min: 0 },
    price: { type: Number, required: true, min: 0 }, // selling price
    priceStr: { type: String }, // auto-generated display string, e.g. '₹15,000'
    discountPercent: { type: Number, default: 0 },

    // ===== 4. Stock =====
    stock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 5 },
    stockStatus: { type: String, enum: ['in_stock', 'out_of_stock'], default: 'in_stock' },

    // ===== 5. Product Details =====
    shortDescription: { type: String, default: '' },
    fullDescription: { type: String, default: '' },
    specifications: { type: [specSchema], default: [] },
    features: { type: [String], default: [] },
    warranty: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },

    // ===== 6. Shipping =====
    weight: { type: Number, default: 0 }, // kg
    dimensions: { type: dimensionsSchema, default: () => ({}) }, // cm
    freeShipping: { type: Boolean, default: true },
    cashOnDelivery: { type: Boolean, default: true },

    // ===== 7. SEO =====
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    slug: { type: String, default: '', trim: true, lowercase: true },

    // ===== 8. Labels =====
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isHotDeal: { type: Boolean, default: false },

    // ===== 9. Visibility =====
    showOnHome: { type: Boolean, default: true },
    showInCategory: { type: Boolean, default: true },
    showInSearch: { type: Boolean, default: true },

    // ===== 10. Related Products =====
    relatedProducts: { type: [Number], default: [] }, // product ids

    // ===== 11. Offers =====
    offerStartDate: { type: Date, default: null },
    offerEndDate: { type: Date, default: null },

    // ===== 12. Customer Options =====
    allowReviews: { type: Boolean, default: true },
    allowRatings: { type: Boolean, default: true },

    // ===== Legacy fields (kept for backward compatibility with existing site) =====
    size: { type: String, default: '' },
    date: { type: Number },
    isActive: { type: Boolean, default: true }, // kept in sync with status !== 'inactive'/'draft'
  },
  { timestamps: true }
);

// ===== Auto-calculations before save =====
productSchema.pre('save', function (next) {
  // priceStr auto-updates whenever price changes
  if (this.isModified('price') || this.isNew) {
    this.priceStr = '₹' + this.price.toLocaleString('en-IN');
  }

  // discount % auto-calculated from MRP vs selling price (unless MRP is 0)
  if (this.mrp && this.mrp > this.price) {
    this.discountPercent = Math.round(((this.mrp - this.price) / this.mrp) * 100);
  } else {
    this.discountPercent = 0;
  }

  // stock status auto-derived from stock count only if not explicitly set by admin
  if (!this.stockStatus || this.isModified('stock')) {
    this.stockStatus = this.stock > 0 ? 'in_stock' : 'out_of_stock';
  }

  // isActive kept in sync with status, so old site code (which filters isActive) keeps working
  this.isActive = this.status === 'active';

  // auto-generate slug from name if not manually set
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  next();
});

module.exports = mongoose.model('Product', productSchema);
