router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = new User({ username, password }); // let schema hash the password
    await user.save();
    req.session.userId = user._id;
    res.json({ message: 'User registered', wallet: user.wallet });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: 'Username already exists or invalid' });
  }
});
