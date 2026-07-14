const express = require('express');
const router = express.Router();
const Refund = require('../models/Refund');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const total = await Refund.countDocuments(filter);
    const refunds = await Refund.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ refunds, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id);
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    res.json(refund);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const refund = new Refund(req.body);
    await refund.save();
    res.status(201).json(refund);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const refund = await Refund.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!refund) return res.status(404).json({ message: 'Refund not found' });
    res.json(refund);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Refund.findByIdAndDelete(req.params.id);
    res.json({ message: 'Refund deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
