const express = require('express');
const Banner = require('../models/Banner');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// PUBLIC — website homepage / all-products banners
router.get('/public', async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    const { position } = req.query;
    const filter = { isActive: true };
    if (position) filter.position = position;
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN — all banners (any status)
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const { position } = req.query;
    const filter = {};
    if (position) filter.position = position;
    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ADMIN — create
router.post('/', requireAdmin, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add banner', error: err.message });
  }
});

// ADMIN — update
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update banner', error: err.message });
  }
});

// ADMIN — toggle active
router.put('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found.' });
    banner.isActive = !banner.isActive;
    await banner.save();
    res.json(banner);
  } catch (err) {
    res.status(400).json({ message: 'Failed to toggle banner', error: err.message });
  }
});

// ADMIN — delete
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Banner not found.' });
    res.json({ message: 'Banner deleted successfully.' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete banner', error: err.message });
  }
});

module.exports = router;
