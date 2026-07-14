require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const couponRoutes = require('./routes/coupons');
const dashboardRoutes = require('./routes/dashboard');
const bannerRoutes = require('./routes/banners');
const teamRoutes = require('./routes/team');
const categoryRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/uploads');
const reviewRoutes = require('./routes/reviews');
const refundRoutes = require('./routes/refunds');
const ticketRoutes = require('./routes/tickets');
const invoiceRoutes = require('./routes/invoices');
const stockRoutes = require('./routes/stock');
const shippingRoutes = require('./routes/shipping');
const paymentRoutes = require('./routes/payments');
const offerRoutes = require('./routes/offers');
const marketingRoutes = require('./routes/marketing');
const supplierRoutes = require('./routes/suppliers');
const shiprocketRoutes = require('./routes/shiprocket');

const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/uploads', express.static(uploadsDir));

const websiteDir = path.join(__dirname, '..', 'website');
if (fs.existsSync(websiteDir)) {
  app.use('/store', express.static(websiteDir));
}

const adminDir = path.join(__dirname, '..', 'admin-panel');
if (fs.existsSync(adminDir)) {
  app.use('/admin', express.static(adminDir));
}

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/shiprocket', shiprocketRoutes);

app.get('/', (req, res) => {
  res.send('Wiscon Industries API is running');
});

app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  const dbOk = mongoose.connection.readyState === 1;
  res.json({ status: 'ok', db: dbOk ? 'connected' : 'disconnected', port: PORT });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server running on port ' + PORT);
    console.log('MongoDB connected');
  });
}).catch((err) => {
  console.error('Failed to start:', err.message);
  process.exit(1);
});

setInterval(async () => {
  try {
    const cfg = await require('./models/ShiprocketConfig').findOne();
    if (!cfg || !cfg.enabled || !cfg.autoTrack) return;
    const { getToken } = require('./services/shiprocket');
    await getToken();
    console.log('[AutoTrack] Running shiprocket sync-all...');
    const Order = require('./models/Order');
    const sr = require('./services/shiprocket');
    const orders = await Order.find({ awb: { $ne: '' }, status: { $nin: ['Delivered', 'Cancelled', 'Returned'] } });
    for (const order of orders) {
      try {
        const data = await sr.trackByAWB(order.awb);
        const tracking = data.tracking_data || data;
        const shipments = tracking.shipment_track || [];
        if (shipments.length > 0) {
          const latest = shipments[0];
          const newStatus = sr.mapStatus(latest.status_id || latest.current_status_id);
          if (newStatus && newStatus !== order.status) {
            order.status = newStatus;
            order.trackingEvents = shipments.map(s => ({ status: s.status || '', location: s.location || '', timestamp: s.scan_date ? new Date(s.scan_date) : new Date() }));
            order.lastTrackingUpdate = new Date();
            order.timeline.push({ status: newStatus, note: 'Auto-synced from Shiprocket', timestamp: new Date() });
            await order.save();
            console.log(`[AutoTrack] Order ${order.orderNumber} → ${newStatus}`);
          }
        }
      } catch (e) { /* skip */ }
    }
  } catch (e) { console.error('[AutoTrack] Error:', e.message); }
}, 30 * 60 * 1000);
