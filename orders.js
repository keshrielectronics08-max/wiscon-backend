const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC (website ke checkout se) =====

router.post('/', async (req, res) => {
  try {
    const body = req.body;
    const orderNumber = 'WI-' + Math.floor(10000 + Math.random() * 89999);
    const order = new Order({ ...body, orderNumber, timeline: [{ status: 'Placed', note: 'Order placed by customer', timestamp: new Date() }] });
    await order.save();
    for (const item of body.items || []) {
      await Product.updateOne({ id: item.productId }, { $inc: { stock: -item.qty } });
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: 'Order place nahi hua', error: err.message });
  }
});

router.get('/mine', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email chahiye.' });
    const orders = await Order.find({ email }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ADMIN ONLY =====

router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;
    const update = { status };
    const timelineEntry = { status, note: note || `Status changed to ${status}`, timestamp: new Date() };
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: update, $push: { timeline: timelineEntry } },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Auto-notify customer on status change
    const notificationMessage = `Your order #${order.orderNumber} is now: ${status}`;
    const whatsappLink = `https://wa.me/${order.phone || ''}?text=${encodeURIComponent(notificationMessage)}`;
    console.log(`[Notification] WhatsApp link prepared: ${whatsappLink}`);
    console.log(`[Notification] Email to ${order.email}: ${notificationMessage}`);

    order.notifications.push({
      type: 'status_update',
      channel: 'whatsapp',
      message: notificationMessage,
      whatsappLink,
      sentAt: new Date(),
      sent: true
    });
    order.notifications.push({
      type: 'status_update',
      channel: 'email',
      message: notificationMessage,
      sentAt: new Date(),
      sent: true
    });
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update status', error: err.message });
  }
});

router.post('/:id/notify', requireAdmin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    const status = order.status || 'Unknown';
    const message = `Your order #${order.orderNumber} is now: ${status}`;
    const whatsappLink = `https://wa.me/${order.phone || ''}?text=${encodeURIComponent(message)}`;

    console.log(`[Notification] Sending status update for order #${order.orderNumber}`);
    console.log(`[Notification] WhatsApp link: ${whatsappLink}`);
    console.log(`[Notification] Email to ${order.email}: ${message}`);

    const notification = {
      type: 'status_update',
      channel: req.body.channel || 'whatsapp',
      message,
      whatsappLink,
      sentAt: new Date(),
      sent: true
    };
    order.notifications.push(notification);
    await order.save();

    res.json({ message: 'Notification sent', notification, whatsappLink });
  } catch (err) {
    res.status(400).json({ message: 'Failed to send notification', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const allowed = ['trackingNumber', 'courierPartner', 'deliveryPerson', 'deliveryPersonPhone', 'estimatedDelivery', 'notes', 'paymentVerified', 'status'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (updates.status) {
      updates.$push = { timeline: { status: updates.status, note: req.body.note || `Status changed to ${updates.status}`, timestamp: new Date() } };
      delete updates.status;
      const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates, $push: updates.$push }, { new: true });
      if (!order) return res.status(404).json({ message: 'Order not found.' });
      return res.json(order);
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found.' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update order', error: err.message });
  }
});

module.exports = router;
