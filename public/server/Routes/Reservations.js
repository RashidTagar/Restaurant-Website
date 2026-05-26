const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../models/database');

// Create reservation
router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('guests').isInt({ min: 1 }).withMessage('Valid number of guests required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, phone, date, time, guests, specialRequests } = req.body;

    const sql = `INSERT INTO reservations (name, email, phone, date, time, guests, special_requests, created_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`;

    db.run(sql, [name, email, phone, date, time, guests, specialRequests || ''], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to create reservation' });
        }
        res.status(201).json({ 
            message: 'Reservation successful!', 
            reservationId: this.lastID,
            confirmation: {
                name,
                email,
                date,
                time,
                guests
            }
        });
    });
});

// Get all reservations (Admin)
router.get('/', (req, res) => {
    db.all('SELECT * FROM reservations ORDER BY date DESC, time DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch reservations' });
        }
        res.json(rows);
    });
});

module.exports = router;