const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  result: { type: String, enum: ['win', 'lose', 'draw'], required: true },
  score: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
