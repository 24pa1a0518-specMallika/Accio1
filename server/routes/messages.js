const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/auth');

function convKey(a, b) {
  return [a, b].sort().join('_');
}

// GET /api/messages/:userId - get conversation with a user
router.get('/:userId', protect, async (req, res) => {
  try {
    const key = convKey(req.user._id.toString(), req.params.userId);
    const messages = await Message.find({ conversation: key })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort('createdAt');
    // Mark received messages as read
    await Message.updateMany({ conversation: key, receiver: req.user._id, isRead: false }, { isRead: true });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages - send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiverId, content, relatedItemId } = req.body;
    if (!receiverId || !content)
      return res.status(400).json({ message: 'receiverId and content required' });

    const msg = await Message.create({
      conversation: convKey(req.user._id.toString(), receiverId),
      sender: req.user._id,
      receiver: receiverId,
      content,
      relatedItem: relatedItemId || null
    });
    const populated = await msg.populate(['sender', 'receiver']);

    // Socket emit
    const io = global.io;
    const connectedUsers = global.connectedUsers;
    if (io && connectedUsers) {
      const receiverSocket = connectedUsers.get(receiverId);
      if (receiverSocket) io.to(receiverSocket).emit('message', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages - list all conversations
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    }).populate('sender', 'name email').populate('receiver', 'name email').sort('-createdAt');

    // Group by conversation
    const convMap = new Map();
    for (const msg of messages) {
      if (!convMap.has(msg.conversation)) convMap.set(msg.conversation, msg);
    }
    res.json([...convMap.values()]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
