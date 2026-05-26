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
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    // Here you would typically send an email using nodemailer
    console.log('Contact Form Submission:', { name, email, subject, message });

    res.status(200).json({ 
        message: 'Thank you for your message! We will get back to you soon.',
        data: { name, email, subject }
    });
});

module.exports = router;