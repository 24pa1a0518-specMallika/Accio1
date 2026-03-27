const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: String, required: true, trim: true },
  dateTime: { type: Date, required: true },
  brand: { type: String, default: '', trim: true },
  colour: { type: String, default: '', trim: true },
  size: { type: String, default: '', trim: true },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['lost', 'found', 'matched', 'returned'],
    default: function () { return this.type; }
  },
  // Visibility control (admin sets this)
  hideBrand: { type: Boolean, default: false },
  hideColour: { type: Boolean, default: false },
  hideSize: { type: Boolean, default: false },
  hideImage: { type: Boolean, default: false },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  matchedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
  matchScore: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Text index for search
itemSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Item', itemSchema);
