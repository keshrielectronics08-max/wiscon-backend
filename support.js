const express = require('express');
const Support = require('../models/Support');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC (website ke Support Center se) =====

// POST /api/support -> {email, customerName, subject, message}
router.post('/', async (req, res) => {
  try {
    const { email, customerName, subject, message } = req.body;
    if (!email || !subject || !message) {
      return res.status(400).json({ message: 'Subject aur message likhna zaroori hai.' });
    }

    const ticket = new Support({ email: email.toLowerCase(), customerName, subject, message });
    await ticket.save();

    res.status(201).json({ message: 'Aapki complaint darj ho gayi. Hum jald contact karenge.', ticket });
  } catch (err) {
    res.status(400).json({ message: 'Complaint submit nahi hui', error: err.message });
  }
});

// GET /api/support/mine?email=xxx -> customer apni complaints dekhe
router.get('/mine', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email chahiye.' });
    const tickets = await Support.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ADMIN ONLY =====

// GET /api/support -> sab complaints (admin panel)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await Support.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/support/:id/status -> {status: 'In Progress' / 'Resolved'}
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await Support.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ message: 'Update fail hua', error: err.message });
  }
});

module.exports = router;
