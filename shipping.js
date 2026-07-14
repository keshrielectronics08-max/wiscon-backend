const express = require('express');
const router = express.Router();
const Shipping = require('../models/Shipping');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const methods = await Shipping.find().sort({ createdAt: -1 });
    res.json({ methods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const method = new Shipping(req.body);
    await method.save();
    res.status(201).json(method);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const method = await Shipping.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!method) return res.status(404).json({ message: 'Shipping method not found' });
    res.json(method);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Shipping.findByIdAndDelete(req.params.id);
    res.json({ message: 'Shipping method deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
