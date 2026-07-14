const express = require('express');
const Coupon = require('../models/Coupon');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC =====

// POST /api/coupons/apply -> checkout.html se coupon check karne ke liye
router.post('/apply', async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    const coupon = await Coupon.findOne({ code: (code || '').toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code.' });
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({ message: 'Ye coupon expire ho chuka hai.' });
    }
    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({ message: `Minimum order ₹${coupon.minOrderValue} hona chahiye.` });
    }

    const discount =
      coupon.discountType === 'percent'
        ? Math.round((orderValue * coupon.discountValue) / 100)
        : coupon.discountValue;

    res.json({ code: coupon.code, discount });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ADMIN ONLY =====

router.get('/', requireAdmin, async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add coupon', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found.' });
    res.json(coupon);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update coupon', error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Coupon.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Coupon not found.' });
  res.json({ message: 'Coupon deleted successfully.' });
});

module.exports = router;
