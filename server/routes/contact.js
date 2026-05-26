const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

router.post('/', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').notEmpty().withMessage('Message is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, subject, message } = req.body;
    console.log('Contact Form:', { name, email, subject, message });

    res.status(200).json({ message: 'Thank you! We will get back to you soon.' });
});

module.exports = router;