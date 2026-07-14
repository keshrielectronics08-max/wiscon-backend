const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// make sure the uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = 'product-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const allowedTypes = /jpeg|jpg|png|webp|gif/;
function fileFilter(req, file, cb) {
  const extOk = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedTypes.test(file.mimetype);
  if (extOk && mimeOk) return cb(null, true);
  cb(new Error('Only image files (jpg, png, webp, gif) are allowed.'));
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, up to 10 at once
});

// POST /api/uploads -> upload multiple product photos at once (admin only)
router.post('/', requireAdmin, (req, res) => {
  upload.array('photos', 10)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message || 'Upload failed.' });
    }
    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }
    const urls = req.files.map((f) => '/uploads/' + f.filename);
    res.status(201).json({ urls });
  });
});

module.exports = router;
