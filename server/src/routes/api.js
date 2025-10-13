const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../services/email.service');
const logger = require('../utils/logger');

const router = express.Router();

// Contact form submission
router.post(
  '/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email'),
    body('subject').optional().trim(),
    body('message').trim().notEmpty().withMessage('Message is required'),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        logger.warn('Contact form validation failed:', { errors: errors.array() });
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const { name, email, subject, message } = req.body;

      logger.info('New contact form submission', { email, subject });

      // Send email
      await emailService.sendContactForm({
        name,
        email,
        subject,
        message,
      });

      // Send success response
      res.status(200).json({
        success: true,
        message: 'Your message has been sent successfully!',
      });
    } catch (error) {
      logger.error('Error processing contact form:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  }
);

module.exports = router;
