const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');
const { processMatches } = require('../services/matchEngine');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Helper: strip admin-only fields for normal users
function sanitizeItem(item, isAdmin) {
  const obj = item.toObject ? item.toObject() : { ...item };
  if (!isAdmin) {
    if (obj.hideBrand) obj.brand = null;
    if (obj.hideColour) obj.colour = null;
    if (obj.hideSize) obj.size = null;
    if (obj.hideImage) obj.image = null;
  }
  return obj;
}

// GET /api/items - list all items with filters
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) query.$text = { $search: search };

    const items = await Item.find(query)
      .populate('reportedBy', 'name email')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Item.countDocuments(query);
    const isAdmin = req.user.role === 'admin';
    const sanitized = items.map(i => sanitizeItem(i, isAdmin));

    res.json({ items: sanitized, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/items/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('reportedBy', 'name email phone').populate('matchedWith');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(sanitizeItem(item, req.user.role === 'admin'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/items - report a new item
router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { type, name, description, location, dateTime, brand, colour, size } = req.body;
    if (!type || !name || !location || !dateTime)
      return res.status(400).json({ message: 'type, name, location, dateTime are required' });

    const item = await Item.create({
      type, name, description, location, dateTime,
      brand, colour, size,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      reportedBy: req.user._id,
      status: type
    });

    // Run matching async (don't block response)
    processMatches(item).catch(console.error);

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/items/:id/status - update status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    item.status = status;
    if (status === 'returned') item.isActive = false;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/items/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (item.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });
    await item.deleteOne();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
