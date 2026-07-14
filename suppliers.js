const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json({ suppliers });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json(supplier);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supplier deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
