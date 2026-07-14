const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');
const SocialLink = require('../models/SocialLink');
const { requireAdmin } = require('../middleware/auth');

// === SOCIAL LINKS (public — website needs to read) ===
router.get('/social-links', async (req, res) => {
  try {
    const links = await SocialLink.find({ active: true }).sort({ sortOrder: 1 });
    res.json({ links });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.use(requireAdmin);

// === SUBSCRIBERS ===
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ subscribers, total: subscribers.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/subscribers', async (req, res) => {
  try {
    const sub = new Subscriber(req.body);
    await sub.save();
    res.status(201).json(sub);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/subscribers/:id', async (req, res) => {
  try {
    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// === SOCIAL LINKS (admin CRUD) ===
router.get('/social', async (req, res) => {
  try {
    const links = await SocialLink.find().sort({ sortOrder: 1 });
    res.json({ links });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/social', async (req, res) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links)) return res.status(400).json({ message: 'links array required' });
    for (const link of links) {
      if (link.platform) {
        await SocialLink.findOneAndUpdate(
          { platform: link.platform },
          { url: link.url || '', label: link.label || '', icon: link.icon || '', active: link.active !== false, sortOrder: link.sortOrder || 0 },
          { upsert: true, new: true }
        );
      }
    }
    const updated = await SocialLink.find().sort({ sortOrder: 1 });
    res.json({ links: updated });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/social/:platform', async (req, res) => {
  try {
    await SocialLink.findOneAndDelete({ platform: req.params.platform });
    res.json({ message: 'Social link removed' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
