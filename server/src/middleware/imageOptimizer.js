const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Image optimization middleware using sharp
 * Automatically resizes and compresses images on-the-fly
 */
const imageOptimizer = async (req, res, next) => {
  // Only process image requests
  const ext = path.extname(req.path).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  if (!imageExtensions.includes(ext)) {
    return next();
  }

  // Get quality and width from query params (with defaults)
  const quality = parseInt(req.query.q) || 80; // Default 80% quality
  const width = parseInt(req.query.w) || null; // No default width
  const format = req.query.f || null; // Optional format conversion

  // If no optimization requested, skip
  if (!req.query.q && !req.query.w && !req.query.f) {
    return next();
  }

  try {
    // Get the file path
    const filePath = path.join(__dirname, '../../..', req.path);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return next();
    }

    // Create sharp instance
    let image = sharp(filePath);
    
    // Get metadata
    const metadata = await image.metadata();

    // Resize if width specified
    if (width && width < metadata.width) {
      image = image.resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Convert format if specified
    if (format === 'webp') {
      image = image.webp({ quality });
      res.type('image/webp');
    } else if (format === 'jpeg' || format === 'jpg') {
      image = image.jpeg({ quality, progressive: true });
      res.type('image/jpeg');
    } else {
      // Use original format with quality
      if (ext === '.jpg' || ext === '.jpeg') {
        image = image.jpeg({ quality, progressive: true });
      } else if (ext === '.png') {
        image = image.png({ quality, progressive: true });
      } else if (ext === '.webp') {
        image = image.webp({ quality });
      }
    }

    // Set cache headers
    res.set('Cache-Control', 'public, max-age=31536000'); // 1 year

    // Stream optimized image
    image.pipe(res);
  } catch (error) {
    console.error('Image optimization error:', error);
    next();
  }
};

module.exports = imageOptimizer;
