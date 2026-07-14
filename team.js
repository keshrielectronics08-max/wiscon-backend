const express = require('express');
const TeamMember = require('../models/TeamMember');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// PUBLIC
router.get('/', async (req, res) => {
  const team = await TeamMember.find({ isActive: true }).sort({ order: 1 });
  res.json(team);
});

// ADMIN ONLY
router.get('/admin/all', requireAdmin, async (req, res) => {
  const team = await TeamMember.find().sort({ order: 1 });
  res.json(team);
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const member = new TeamMember(req.body);
    await member.save();
    res.status(201).json(member);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add team member', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!member) return res.status(404).json({ message: 'Team member not found.' });
    res.json(member);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update team member', error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await TeamMember.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Team member not found.' });
  res.json({ message: 'Team member deleted successfully.' });
});

module.exports = router;
