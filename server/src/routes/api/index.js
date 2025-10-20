const express = require('express');
const router = express.Router();

const mediaRoutes = require('./media');
const contactRoutes = require('./contact');

// Legacy media routes (for backward compatibility)
router.use('/media', mediaRoutes);

// New database-powered media routes
router.use('/database', mediaRoutes);

router.use('/contact', contactRoutes);

module.exports = router;
