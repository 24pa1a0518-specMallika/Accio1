const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    console.log(`Registration attempt for: ${email}`);
    
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields required' });

    const exists = await User.findOne({ email });
    if (exists) {
      console.log(`User ${email} already exists in MongoDB`);
      // If user exists, we might want to just return the user info if they authenticated with Firebase
      // But for now, let's keep it strict but logged.
      return res.status(400).json({ message: 'Email already registered in system' });
    }

    const role = adminCode === process.env.ADMIN_CODE ? 'admin' : 'user';
    const user = await User.create({ name, email, password, role });
    console.log(`User ${email} created successfully in MongoDB`);

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Registration Backend Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User ${email} not found in MongoDB`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!(await user.comparePassword(password))) {
      console.log(`Password mismatch for user: ${email}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User ${email} logged in successfully`);
    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Login Backend Error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });
});

module.exports = router;
