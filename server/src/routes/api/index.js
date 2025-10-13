const express = require('express');
const router = express.Router();

const mediaRoutes = require('./media');
const contactRoutes = require('./contact');

router.use('/media', mediaRoutes);
router.use('/contact', contactRoutes);

module.exports = router;
