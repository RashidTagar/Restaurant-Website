const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const reservationRoutes = require('./routes/reservation');
const contactRoutes = require('./routes/contact');

app.use('/api/reservations', reservationRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, '../public/about.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, '../public/menu.html')));
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, '../public/gallery.html')));
app.get('/reservations', (req, res) => res.sendFile(path.join(__dirname, '../public/reservations.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, '../public/contact.html')));

app.listen(PORT, () => {
    console.log(`🍷 Server running at http://localhost:${PORT}`);
    console.log(`📍 Bistrot Des Tournelles - Paris`);
});