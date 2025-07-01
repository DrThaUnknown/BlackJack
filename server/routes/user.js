const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.patch('/wallet', async (req, res) => {
  try {
    if (req.session.blackjack?.status === 'in progress') {
      return res.status(403).json({ error: 'Cannot reset wallet during a game' });
    }

    const user = await User.findById(req.session.userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    user.wallet = 1000;
    await user.save();

    req.session.blackjack = null; // also clear active game just in case
    res.json({ wallet: user.wallet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset wallet' });
  }
});

module.exports = router;
