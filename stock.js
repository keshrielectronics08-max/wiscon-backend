const express = require('express');
const router = express.Router();
const StockHistory = require('../models/StockHistory');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

router.get('/', async (req, res) => {
  try {
    const { productId, type, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (productId) filter.productId = Number(productId);
    if (type) filter.type = type;
    const total = await StockHistory.countDocuments(filter);
    const history = await StockHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ history, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = new StockHistory(req.body);
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
