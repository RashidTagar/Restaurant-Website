const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models/User');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio (get credentials from https://twilio.com)
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email transporter (use Gmail or SendGrid)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ========================================
// 📧 REGISTER WITH EMAIL
// ========================================
router.post('/register/email', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate email verification OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Save user
    db.run(
      `INSERT INTO users (email, password, otp_code, otp_expires) VALUES (?, ?, ?, ?)`,
      [email, hashedPassword, otp, otpExpires],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Send verification email
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Verify your Bistrot account',
          text: `Your verification code is: ${otp}\nValid for 10 minutes.`
        });
        
        res.json({ 
          message: 'Registration successful! Check your email for verification code.',
          userId: this.lastID 
        });
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================================
// 📱 REGISTER WITH PHONE (SMS OTP)
// ========================================
router.post('/register/phone', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate SMS OTP
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    
    // Save user
    db.run(
      `INSERT INTO users (phone, password, otp_code, otp_expires) VALUES (?, ?, ?, ?)`,
      [phone, hashedPassword, otp, otpExpires],
      async function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint')) {
            return res.status(400).json({ error: 'Phone already registered' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Send SMS via Twilio
        try {
          await twilioClient.messages.create({
            body: `Your Bistrot verification code: ${otp}\nValid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
          });
          
          res.json({ 
            message: 'Registration successful! Check your phone for verification code.',
            userId: this.lastID 
          });
        } catch (smsError) {
          console.error('SMS error:', smsError);
          res.status(500).json({ error: 'Failed to send SMS' });
        }
      }
    );
  } catch (error) {
    console.error('Phone registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================================
// 🔐 VERIFY OTP (Email or Phone)
// ========================================
router.post('/verify-otp', (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    
    const query = email 
      ? `SELECT * FROM users WHERE email = ? AND otp_code = ? AND otp_expires > ?`
      : `SELECT * FROM users WHERE phone = ? AND otp_code = ? AND otp_expires > ?`;
    
    const params = email ? [email, otp, new Date()] : [phone, otp, new Date()];
    
    db.get(query, params, (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(400).json({ error: 'Invalid or expired code' });
      
      // Mark as verified & clear OTP
      const updateField = email ? 'email_verified' : 'phone_verified';
      db.run(
        `UPDATE users SET ${updateField} = 1, otp_code = NULL, otp_expires = NULL WHERE id = ?`,
        [user.id],
        (err) => {
          if (err) return res.status(500).json({ error: 'Verification failed' });
          
          // Generate JWT token
          const token = jwt.sign(
            { userId: user.id, email: user.email, phone: user.phone },
            process.env.JWT_SECRET || 'your-secret-key-change-this',
            { expiresIn: '7d' }
          );
          
          res.json({
            message: 'Verification successful!',
            token,
            user: {
              id: user.id,
              email: user.email,
              phone: user.phone,
              email_verified: user.email_verified,
              phone_verified: user.phone_verified
            }
          });
        }
      );
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================================
// 🔑 LOGIN
// ========================================
router.post('/login', (req, res) => {
  try {
    const { email, phone, password } = req.body;
    
    const query = email 
      ? `SELECT * FROM users WHERE email = ?`
      : `SELECT * FROM users WHERE phone = ?`;
    
    const param = email || phone;
    
    db.get(query, [param], async (err, user) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (!user) return res.status(400).json({ error: 'User not found' });
      
      // Check password (if using password login)
      if (password && user.password) {
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return res.status(400).json({ error: 'Invalid password' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, phone: user.phone },
        process.env.JWT_SECRET || 'your-secret-key-change-this',
        { expiresIn: '7d' }
      );
      
      res.json({
        message: 'Login successful!',
        token,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ========================================
// 🔵 GOOGLE OAUTH (Simplified)
// ========================================
// Note: Full Google OAuth requires passport setup
// For demo, here's the callback handler:
router.get('/google/callback', (req, res) => {
  // This would be handled by passport-google-oauth20
  // For now, redirect to frontend with mock token
  const mockToken = jwt.sign(
    { userId: 999, email: 'google-user@example.com', google_auth: true },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
  
  res.redirect(`https://your-frontend.com/auth-success?token=${mockToken}`);
});

// ========================================
// 👤 GET CURRENT USER (Protected Route)
// ========================================
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    db.get(`SELECT id, email, phone, email_verified, phone_verified FROM users WHERE id = ?`, 
      [decoded.userId], 
      (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'User not found' });
        res.json({ user });
      }
    );
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;