const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Import routes
const reservationRoutes = require('./routes/reservation');
const contactRoutes = require('./routes/contact');

// Use routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/about.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/menu.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/gallery.html'));
});

app.get('/reservations', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/reservations.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/contact.html'));
});
   // Import auth routes
const authRoutes = require('./routes/auth');

// Use auth routes
app.use('/api/auth', authRoutes);

// Protect admin routes (optional middleware)
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Protect admin routes with authentication
app.use('/admin', authenticateToken);
// Start server
app.listen(PORT, () => {
    console.log(`🍷 Server running at http://localhost:${PORT}`);
    console.log(`📍 Bistrot Des Tournelles - Paris`);
});

// Admin pages
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin/dashboard.html'));
});
