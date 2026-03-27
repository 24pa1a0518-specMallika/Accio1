const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/admin/items - all items with full details
router.get('/items', protect, adminOnly, async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 50 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const items = await Item.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('matchedWith')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);
    res.json({ items, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/items/:id/visibility - toggle field visibility
router.put('/items/:id/visibility', protect, adminOnly, async (req, res) => {
  try {
    const { hideBrand, hideColour, hideSize, hideImage } = req.body;
    const item = await Item.findByIdAndUpdate(
      req.params.id,
      { hideBrand, hideColour, hideSize, hideImage },
      { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/items/:id/status
router.put('/items/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/items/:id
router.delete('/items/:id', protect, adminOnly, async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
