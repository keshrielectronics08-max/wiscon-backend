const express = require('express');
const Settings = require('../models/Settings');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

async function getOrCreateSettings() {
  let settings = await Settings.findOne({ key: 'site_settings' });
  if (!settings) {
    settings = await Settings.create({ key: 'site_settings' });
  }
  return settings;
}

// PUBLIC — website ke liye
router.get('/', async (req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

// ADMIN ONLY
router.put('/', requireAdmin, async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update settings', error: err.message });
  }
});

module.exports = router;
