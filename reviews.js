const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');

const router = express.Router();

// GET /api/reviews/:productId -> saare reviews for a product + rating summary
router.get('/:productId', async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    const total = reviews.length;
    const avg = total > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : 0;

    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { dist[r.rating] = (dist[r.rating] || 0) + 1; });

    res.json({ reviews, total, avg: Number(avg), distribution: dist });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/reviews -> naya review add karo (login optional)
router.post('/', async (req, res) => {
  try {
    const { productId, userName, rating, title, comment, userId } = req.body;

    if (!productId || !userName || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, name, rating aur comment zaroori hain.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating 1 se 5 ke beech honi chahiye.' });
    }

    // Check if product exists
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ message: 'Product nahi mila.' });

    const review = new Review({
      productId,
      userId: userId || null,
      userName,
      rating: Math.round(rating),
      title: title || '',
      comment,
      verified: false,
    });

    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: 'Review add nahi ho paya', error: err.message });
  }
});

// POST /api/reviews/:id/helpful -> helpful count increment
router.post('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: 'Review nahi mila.' });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
