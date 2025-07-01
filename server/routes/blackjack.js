const express = require('express');
const session = require('express-session');
const BlackjackGame = require('../utils/gameLogic');

const router = express.Router();
const User = require('../models/User');

router.use(session({
  secret: 'blackjack-secret',
  resave: false,
  saveUninitialized: true,
}));

router.use((req, res, next) => {
  const savedState = req.session.gameState || null;
  req.game = new BlackjackGame(savedState);
  next();
});

router.post('/start', async (req, res) => {
  const { bet } = req.body;
  if (!req.session.userId) return res.status(403).json({ error: 'Login first' });
  if (!bet || isNaN(bet)) return res.status(400).json({ error: 'Invalid bet' });
  const user = await User.findById(req.session.userId);

  try {
    req.game.wallet = user.wallet;
    req.game.placeBet(bet);
    user.wallet = req.game.wallet;
    await user.save();
    req.session.gameState = req.game.getState();
    res.json(req.game.getState());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/hit', async (req, res) => {
  req.game.playerHit();
  req.session.gameState = req.game.getState();
  res.json(req.session.gameState);
});


router.post('/stand', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ error: 'Not logged in' });
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Not logged in' });

    // Use the game instance from middleware
    req.game.playerStand();
    const state = req.game.getState();

    // Update wallet and history
    user.wallet = req.game.wallet;
    user.history.push({
      result: state.result,
      wager: state.bet
    });
    await user.save();

    req.session.gameState = state;

    res.json({
      dealer: state.dealer,
      status: state.status,
      result: state.result,
      wallet: user.wallet
    });
  } catch (err) {
    console.error('❌ Stand route error:', err);
    res.status(500).json({ error: 'Server error on stand' });
  }
});
router.get('/stats', async (req, res) => {
  if (!req.session.userId) return res.status(403).json({ error: 'Login first' });
  const user = await User.findById(req.session.userId).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Ensure history is always an array
  const history = Array.isArray(user.history) ? user.history : [];
  const last5 = history.slice(-5).reverse();
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].result === 'win') {
      streak++;
    } else {
      break;
    }
  }

  // Add explicit fields
  res.json({
    username: user.username,
    wallet: user.wallet,
    history: user.history,
    streak,
    last5
  });
});


module.exports = router;
