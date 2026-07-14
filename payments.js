const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const { status, method, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (method) filter.method = method;
    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totalAmount = payments.reduce((s, p) => s + (p.amount || 0), 0);
    res.json({ payments, total, totalAmount, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
