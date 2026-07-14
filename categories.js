const express = require('express');
const Category = require('../models/Category');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// PUBLIC
router.get('/', async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ order: 1 });
  res.json(categories);
});

// ADMIN ONLY
router.get('/admin/all', requireAdmin, async (req, res) => {
  const categories = await Category.find().sort({ order: 1 });
  res.json(categories);
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add category', error: err.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: 'Category not found.' });
    res.json(category);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update category', error: err.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: 'Category not found.' });
  res.json({ message: 'Category deleted successfully.' });
});

module.exports = router;
