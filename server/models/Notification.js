const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  type: {
    type: String,
    enum: ['match_found', 'item_returned', 'message', 'system'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  matchedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
