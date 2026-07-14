const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/Admin');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'avatar-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) return cb(null, true);
    cb(new Error('Only image files (jpg, png, webp) are allowed.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar || '', phone: admin.phone || '' },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/auth/profile -> update name, phone
router.put('/profile', requireAdmin, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const update = {};
    if (name !== undefined && name.trim()) update.name = name.trim();
    if (phone !== undefined) update.phone = phone.trim();

    const admin = await Admin.findByIdAndUpdate(req.admin.id, update, { new: true }).select('-password');
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    res.json({ admin: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar || '', phone: admin.phone || '' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/auth/email -> update email
router.put('/email', requireAdmin, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and current password are required.' });

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password.' });

    const exists = await Admin.findOne({ email: email.toLowerCase(), _id: { $ne: admin._id } });
    if (exists) return res.status(400).json({ message: 'This email is already in use.' });

    admin.email = email.toLowerCase();
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, admin: { name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar || '', phone: admin.phone || '' } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/auth/password -> change password
router.put('/password', requireAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both current and new password are required.' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters.' });

    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Incorrect current password.' });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/auth/avatar -> remove profile photo
router.delete('/avatar', requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);
    if (!admin) return res.status(404).json({ message: 'Admin not found.' });

    if (admin.avatar && admin.avatar.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '..', admin.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    admin.avatar = '';
    await admin.save();

    res.json({ message: 'Avatar removed.', avatar: '' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/avatar -> upload profile photo
router.post('/avatar', requireAdmin, (req, res) => {
  avatarUpload.single('avatar')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message || 'Upload failed.' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    try {
      const admin = await Admin.findById(req.admin.id);
      if (!admin) return res.status(404).json({ message: 'Admin not found.' });

      if (admin.avatar && admin.avatar.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', admin.avatar);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      admin.avatar = '/uploads/' + req.file.filename;
      await admin.save();

      res.json({ avatar: admin.avatar });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
});

module.exports = router;
