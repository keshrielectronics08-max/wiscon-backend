const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: String,
    price: Number,
    qty: Number,
    image: String,
  },
  { _id: false }
);

const timelineEntrySchema = new mongoose.Schema(
  {
    status: String,
    note: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerName: String,
    email: { type: String, required: true },
    phone: String,
    address: String,
    shippingAddress: { type: String, default: '' },
    items: { type: [orderItemSchema], default: [] },
    itemsCount: Number,
    subtotal: Number,
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    total: Number,
    paymentMethod: { type: String, enum: ['UPI', 'Card', 'Netbanking', 'COD'], default: 'COD' },
    paymentDetails: { type: Object, default: {} },
    paymentVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Packed', 'Pickup', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'],
      default: 'Placed',
    },
    trackingNumber: { type: String, default: '' },
    courierPartner: { type: String, default: '' },
    shiprocketOrderId: { type: Number, default: null },
    shiprocketShipmentId: { type: Number, default: null },
    awb: { type: String, default: '' },
    lastTrackingUpdate: { type: Date, default: null },
    trackingEvents: [{
      status: String,
      location: { type: String, default: '' },
      timestamp: Date,
      _id: false,
    }],
    deliveryPerson: { type: String, default: '' },
    deliveryPersonPhone: { type: String, default: '' },
    estimatedDelivery: { type: Date, default: null },
    timeline: { type: [timelineEntrySchema], default: [] },
    notifications: [{
      type: { type: String, default: 'status_update' },
      channel: { type: String, default: 'whatsapp' },
      message: { type: String, default: '' },
      sentAt: { type: Date, default: Date.now },
      sent: { type: Boolean, default: false },
      _id: false,
    }],
    notes: { type: String, default: '' },
    notificationSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
