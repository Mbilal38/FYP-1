const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory store for OTPs (replace with Redis or database in production)
const otpStore = new Map();

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test Route
router.get('/test', (req, res) => {
  res.send('Auth route is working!');
});

// Send OTP Route (for Signup)
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use. Please log in.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore.set(email, { otp, expiry: otpExpiry, type: 'signup' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for My-OTT Signup',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

// Send Reset OTP Route (for Forgot Password)
router.post('/send-reset-otp', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email not found. Please sign up.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

    otpStore.set(email, { otp, expiry: otpExpiry, type: 'reset' });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP for My-OTT',
      text: `Your OTP for password reset is ${otp}. It is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    console.error('Error sending reset OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP.', error: error.message });
  }
});

// Verify OTP Route
router.post('/verify-otp', (req, res) => {
  const { email, otp, type } = req.body;

  try {
    const otpData = otpStore.get(email);
    if (!otpData || Date.now() > otpData.expiry || otpData.type !== type) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Incorrect OTP.' });
    }

    otpStore.delete(email);
    res.status(200).json({ message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error during OTP verification.', error: error.message });
  }
});

// Reset Password Route
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpData = otpStore.get(email);
    if (!otpData || Date.now() > otpData.expiry || otpData.otp !== otp || otpData.type !== 'reset') {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    otpStore.delete(email);

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error during password reset.', error: error.message });
  }
});

// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use. Please log in or use a different email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash: hashedPassword,
      username,
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already in use. Please log in or use a different email.' });
    }
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Invalid email or password.' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ message: 'This account was created with Google. Please use Google login.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, message: 'Login successful.' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Server error. Please try again later.', error: error.message });
  }
});

// Google Login Route
router.post('/google', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, username: name });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ success: true, token: jwtToken, message: 'Google login successful.' });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google token.', error: error.message });
  }
});

module.exports = router;