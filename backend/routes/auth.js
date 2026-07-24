const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_key_for_skillswap_ai_2026', {
    expiresIn: '30d',
  });
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user (+100 SkillCoins)
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user. Note: pre('save') hashes password, default coins set to 100
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillCoins: user.skillCoins,
        trustScore: user.trustScore,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data provided' });
    }
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error during signup', error: error.message });
  }
});

const parseUserAgent = (ua) => {
  if (!ua) return 'Unknown Device';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  return `${browser} on ${os}`;
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user and select password (since it is excluded by default)
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      // Parse request details for sessions
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'Unknown Device';
      const deviceName = parseUserAgent(userAgent);
      const cleanIp = ip === '::1' ? '127.0.0.1' : ip;

      // Update login info
      user.lastLogin = new Date();

      // Reset previous current sessions
      user.activeSessions.forEach(s => {
        s.current = false;
      });

      // Add new session
      user.activeSessions.push({
        device: deviceName,
        ip: cleanIp,
        lastActive: new Date(),
        current: true
      });

      // Cap active sessions at 5
      if (user.activeSessions.length > 5) {
        user.activeSessions.shift();
      }

      await user.save();

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        skillsTeach: user.skillsTeach,
        skillsLearn: user.skillsLearn,
        experience: user.experience,
        availability: user.availability,
        skillCoins: user.skillCoins,
        trustScore: user.trustScore,
        bio: user.bio,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        notificationSettings: user.notificationSettings,
        privacySettings: user.privacySettings,
        activeSessions: user.activeSessions,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
});

module.exports = router;
