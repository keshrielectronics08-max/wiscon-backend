const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC (website ke Login/Signup ke liye) =====

// POST /api/users/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Ye email pehle se registered hai.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email: email.toLowerCase(), password: hashed, phone });
    await user.save();

    res.status(201).json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(400).json({ message: 'Signup fail hua', error: err.message });
  }
});

// POST /api/users/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Galat email ya password.' });
    if (user.isBlocked) return res.status(403).json({ message: 'Ye account block kar diya gaya hai.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Galat email ya password.' });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ADMIN ONLY =====

// GET /api/users -> sab customers ki list
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/users/:id/block -> customer block/unblock
router.put('/:id/block', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ email: user.email, isBlocked: user.isBlocked });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
