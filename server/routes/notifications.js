const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

// GET /api/notifications - get my notifications
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name email')
      .populate('relatedItem', 'name type')
      .sort('-createdAt')
      .limit(50);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true }, { new: true }
    );
    if (!notif) return res.status(404).json({ message: 'Not found' });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
