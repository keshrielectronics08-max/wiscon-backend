const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const ShiprocketConfig = require('../models/ShiprocketConfig');
const sr = require('../services/shiprocket');

const STATUS_MAP = sr.STATUS_MAP;

function mapStatus(code) {
  return STATUS_MAP[String(code)] || null;
}

// ===== GET CONFIG =====
router.get('/config', requireAdmin, async (req, res) => {
  try {
    let cfg = await ShiprocketConfig.findOne();
    if (!cfg) cfg = await ShiprocketConfig.create({});
    res.json({
      email: cfg.email,
      channelId: cfg.channelId,
      pickupLocation: cfg.pickupLocation,
      enabled: cfg.enabled,
      autoTrack: cfg.autoTrack,
      notifyCustomer: cfg.notifyCustomer,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== SAVE CONFIG =====
router.put('/config', requireAdmin, async (req, res) => {
  try {
    let cfg = await ShiprocketConfig.findOne();
    if (!cfg) cfg = new ShiprocketConfig();
    const { email, password, channelId, pickupLocation, enabled, autoTrack, notifyCustomer } = req.body;
    if (email !== undefined) cfg.email = email;
    if (password !== undefined && password !== '') cfg.password = password;
    if (channelId !== undefined) cfg.channelId = channelId;
    if (pickupLocation !== undefined) cfg.pickupLocation = pickupLocation;
    if (enabled !== undefined) cfg.enabled = enabled;
    if (autoTrack !== undefined) cfg.autoTrack = autoTrack;
    if (notifyCustomer !== undefined) cfg.notifyCustomer = notifyCustomer;
    // Force re-login if credentials changed
    if (email || password) { cfg.token = ''; cfg.tokenExpiry = null; }
    await cfg.save();
    res.json({ message: 'Shiprocket config saved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== TEST CONNECTION =====
router.post('/test', requireAdmin, async (req, res) => {
  try {
    const cfg = await sr.getConfig();
    if (!cfg.enabled) return res.status(400).json({ message: 'Shiprocket not enabled' });
    const token = await sr.getToken();
    res.json({ message: 'Shiprocket connected successfully', tokenExpiry: cfg.tokenExpiry });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// ===== CREATE SHIPMENT =====
router.post('/create-shipment/:orderId', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.awb) return res.status(400).json({ message: 'Shipment already exists' });

    const cfg = await sr.getConfig();
    if (!cfg.enabled) return res.status(400).json({ message: 'Shiprocket not configured' });

    const srOrder = await sr.srFetch('/orders/create/adhoc', {
      method: 'POST',
      body: JSON.stringify({
        order_id: order.orderNumber,
        order_date: order.createdAt.toISOString().split('T')[0],
        pickup_location: cfg.pickupLocation,
        channel_id: cfg.channelId,
        billing_customer_name: order.customerName || 'Customer',
        billing_address: order.shippingAddress || order.address || '',
        billing_city: '',
        billing_pincode: '',
        billing_state: '',
        billing_country: 'India',
        billing_phone: order.phone || '',
        billing_email: order.email,
        shipping_is_billing: true,
        order_items: (order.items || []).map(i => ({
          name: i.name || 'Product',
          sku: 'SKU-' + i.productId,
          units: i.qty || 1,
          selling_price: i.price || 0,
        })),
        payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        sub_total: order.subtotal || order.total || 0,
        length: 10, breadth: 10, height: 10, weight: 1,
      }),
    });

    order.shiprocketOrderId = srOrder.order_id;
    await order.save();

    // Assign courier
    try {
      const assignData = await sr.assignCourier({
        shipment_id: [],
        order_id: srOrder.order_id,
      });
      if (assignData.response && assignData.response.data) {
        const d = assignData.response.data;
        const awb = d.awb || d.awb_code || '';
        const courier = d.courier_name || '';
        const shipmentId = d.shipment_id || null;
        if (awb) order.awb = awb;
        if (awb) order.trackingNumber = awb;
        if (courier) order.courierPartner = courier;
        if (shipmentId) order.shiprocketShipmentId = shipmentId;
        await order.save();
      }
    } catch (e) { /* courier assign might fail, not critical */ }

    res.json({ message: 'Shipment created', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== TRACK ORDER =====
router.get('/track/:orderId', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.awb) return res.status(400).json({ message: 'No AWB number found' });

    const data = await sr.trackByAWB(order.awb);
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== SYNC TRACKING (manual refresh) =====
router.post('/sync/:orderId', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.awb) return res.status(400).json({ message: 'No AWB number' });

    const data = await sr.trackByAWB(order.awb);
    const tracking = data.tracking_data || data;
    const shipments = tracking.shipment_track || [];

    if (shipments.length > 0) {
      const events = shipments.map(s => ({
        status: s.status || '',
        location: s.location || '',
        timestamp: s.scan_date ? new Date(s.scan_date) : new Date(),
      }));

      order.trackingEvents = events;
      order.lastTrackingUpdate = new Date();

      const latest = shipments[0];
      const newStatus = mapStatus(latest.status_id || latest.current_status_id);
      if (newStatus && newStatus !== order.status) {
        order.status = newStatus;
        order.timeline.push({
          status: newStatus,
          note: 'Auto-updated via Shiprocket tracking',
          timestamp: new Date(),
        });
        // Auto-notification on status change
        order.notifications.push({
          type: 'status_update',
          channel: 'whatsapp',
          message: `Your order #${order.orderNumber} is now: ${newStatus}. ${order.awb ? 'Track: ' + order.awb : ''}`,
          sentAt: new Date(),
          sent: true,
        });
      }

      await order.save();
    }

    res.json({ message: 'Tracking synced', order, tracking });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== REQUEST PICKUP =====
router.post('/pickup/:orderId', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!order.awb) {
      return res.status(400).json({ message: 'No AWB found. Create shipment first.' });
    }
    // Try Shiprocket pickup if shipment ID exists
    if (order.shiprocketShipmentId) {
      try { await sr.requestPickup(order.shiprocketShipmentId); } catch (e) { /* continue */ }
    }
    // Auto status to Pickup
    order.status = 'Pickup';
    order.timeline.push({
      status: 'Pickup',
      note: 'Pickup requested from courier',
      timestamp: new Date(),
    });
    await order.save();
    res.json({ message: 'Pickup requested', order });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// ===== WEBHOOK (auto updates from Shiprocket) =====
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const payload = JSON.parse(req.body);
    const { order_id, status, awb, current_status, scan_type, location } = payload;

    const order = await Order.findOne({
      $or: [{ shiprocketOrderId: order_id }, { orderNumber: String(order_id) }, { awb }],
    });
    if (!order) return res.status(200).json({ ok: true });

    const newStatus = mapStatus(status || payload.status_id);
    if (newStatus && newStatus !== order.status) {
      order.status = newStatus;
      order.timeline.push({
        status: newStatus,
        note: 'Auto-updated via Shiprocket webhook',
        timestamp: new Date(),
      });

      // Auto-notification on status change
      order.notifications.push({
        type: 'status_update',
        channel: 'whatsapp',
        message: `Your order #${order.orderNumber} is now: ${newStatus}. ${order.awb ? 'Track: ' + order.awb : ''}`,
        sentAt: new Date(),
        sent: true,
      });

      await order.save();
      console.log(`[Shiprocket Webhook] Order ${order.orderNumber} → ${newStatus}`);
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(200).json({ ok: true });
  }
});

// ===== AUTO TRACK ALL PENDING (cron-like) =====
router.post('/sync-all', requireAdmin, async (req, res) => {
  try {
    const cfg = await sr.getConfig();
    if (!cfg.enabled || !cfg.autoTrack) {
      return res.json({ message: 'Auto-tracking disabled', updated: 0 });
    }

    const orders = await Order.find({
      awb: { $ne: '' },
      status: { $nin: ['Delivered', 'Cancelled', 'Returned'] },
    });

    let updated = 0;
    for (const order of orders) {
      try {
        const data = await sr.trackByAWB(order.awb);
        const tracking = data.tracking_data || data;
        const shipments = tracking.shipment_track || [];
        if (shipments.length > 0) {
          const latest = shipments[0];
          const newStatus = mapStatus(latest.status_id || latest.current_status_id);
          if (newStatus && newStatus !== order.status) {
            order.status = newStatus;
            order.trackingEvents = shipments.map(s => ({
              status: s.status || '',
              location: s.location || '',
              timestamp: s.scan_date ? new Date(s.scan_date) : new Date(),
            }));
            order.lastTrackingUpdate = new Date();
            order.timeline.push({
              status: newStatus,
              note: 'Auto-synced from Shiprocket',
              timestamp: new Date(),
            });
            await order.save();
            updated++;
          }
        }
      } catch (e) { /* skip failed orders */ }
    }

    res.json({ message: `Synced ${updated} orders`, updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
