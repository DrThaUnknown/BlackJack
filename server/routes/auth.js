const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const isAuth = require('../utils/isAuth');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = new User({ username: username.trim(), password });
    await user.save();
    req.session.userId = user._id;
    res.status(201).json({ message: 'User registered', wallet: user.wallet });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(400).json({ error: 'Username already exists or invalid' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await User.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user._id;

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        wallet: user.wallet,
        history: user.history,
      },
    });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout Error:', err.message);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// Protected route
router.get('/me', isAuth, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      id: user._id,
      username: user.username,
      wallet: user.wallet,
      history: user.history,
    });
  } catch (err) {
    console.error('Fetch user error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

module.exports = router;
