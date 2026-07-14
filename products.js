const express = require('express');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// ===== PUBLIC (website ke liye — koi login nahi chahiye) =====

// GET /api/products  -> sab active products (website ke liye)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ date: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product nahi mila.' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ===== ADMIN ONLY (login chahiye) =====

// GET /api/products/admin/all -> saare products (inactive bhi) admin panel ke liye
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/products -> naya product add
router.post('/', requireAdmin, async (req, res) => {
  try {
    const last = await Product.findOne().sort({ id: -1 });
    const nextId = last ? last.id + 1 : 1;

    const product = new Product({ ...req.body, id: nextId });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to add product', error: err.message });
  }
});

// PUT /api/products/:id -> product edit
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Product not found.' });

    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update product', error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
