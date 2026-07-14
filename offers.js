const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const FlashSale = require('../models/FlashSale');
const ComboDeal = require('../models/ComboDeal');
const GiftCard = require('../models/GiftCard');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// === COUPONS ===
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ coupons });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/coupons', async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/coupons/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });
    res.json(coupon);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// === FLASH SALES ===
router.get('/flash', async (req, res) => {
  try {
    const flash = await FlashSale.find().sort({ createdAt: -1 });
    res.json({ flashSales: flash });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/flash', async (req, res) => {
  try {
    const sale = new FlashSale(req.body);
    await sale.save();
    res.status(201).json(sale);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/flash/:id', async (req, res) => {
  try {
    const sale = await FlashSale.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!sale) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(sale);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/flash/:id', async (req, res) => {
  try {
    await FlashSale.findByIdAndDelete(req.params.id);
    res.json({ message: 'Flash sale deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// === COMBO DEALS ===
router.get('/combo', async (req, res) => {
  try {
    const combos = await ComboDeal.find().sort({ createdAt: -1 });
    res.json({ comboDeals: combos });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/combo', async (req, res) => {
  try {
    const deal = new ComboDeal(req.body);
    await deal.save();
    res.status(201).json(deal);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/combo/:id', async (req, res) => {
  try {
    const deal = await ComboDeal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!deal) return res.status(404).json({ message: 'Combo deal not found' });
    res.json(deal);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/combo/:id', async (req, res) => {
  try {
    await ComboDeal.findByIdAndDelete(req.params.id);
    res.json({ message: 'Combo deal deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// === GIFT CARDS ===
router.get('/gift', async (req, res) => {
  try {
    const cards = await GiftCard.find().sort({ createdAt: -1 });
    res.json({ giftCards: cards });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/gift', async (req, res) => {
  try {
    if (!req.body.code) req.body.code = 'GC-' + Date.now().toString(36).toUpperCase();
    const card = new GiftCard(req.body);
    await card.save();
    res.status(201).json(card);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/gift/:id', async (req, res) => {
  try {
    const card = await GiftCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!card) return res.status(404).json({ message: 'Gift card not found' });
    res.json(card);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/gift/:id', async (req, res) => {
  try {
    await GiftCard.findByIdAndDelete(req.params.id);
    res.json({ message: 'Gift card deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
