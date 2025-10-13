const express = require('express');
const { body, validationResult } = require('express-validator');
const emailService = require('../../services/email.service');
const logger = require('../../utils/logger');

const router = express.Router();

const contactFormValidationRules = [
  body('name').trim().not().isEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').trim().not().isEmpty().withMessage('Phone is required'),
  body('location').trim().not().isEmpty().withMessage('Location is required'),
  body('eventDateStart').isISO8601().withMessage('A valid start date is required'),
  body('message').trim().not().isEmpty().withMessage('Message is required'),
];

router.post('/', contactFormValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const submission = req.body;
    await emailService.sendContactForm(submission);
    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    logger.error('Failed to send contact form email:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again later.' });
  }
});

module.exports = router;
