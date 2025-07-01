function isAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next(); // User is logged in
  } else {
    return res.status(401).json({ error: 'Not authenticated' });
  }
}

module.exports = isAuth;
