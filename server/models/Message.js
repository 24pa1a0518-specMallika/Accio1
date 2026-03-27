const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversation: { type: String, required: true }, // "userId1_userId2" sorted
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true, trim: true },
  relatedItem: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', messageSchema);
