require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const blackjackRoutes = require('./routes/blackjack');

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true if using HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, // adjust this
    ttl: 24 * 60 * 60, // 1 day
  }),
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/blackjack', blackjackRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// DB + Server start
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));
  })
  .catch(err => console.error('❌ MongoDB connection failed', err));

