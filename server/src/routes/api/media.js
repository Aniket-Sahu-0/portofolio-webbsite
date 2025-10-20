const express = require('express');
const router = express.Router();
const ImageDatabase = require('../../database/imageDatabase');

const imageDB = new ImageDatabase();

// Get all images organized by category
router.get('/all', (req, res) => {
  try {
    const images = imageDB.getAllImages();
    const stats = imageDB.getStats();
    
    res.json({
      success: true,
      data: {
        images,
        stats
      }
    });
  } catch (error) {
    console.error('Error fetching all images:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
});

// Get images by category
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const images = imageDB.getImagesByCategory(category);
    
    res.json({
      success: true,
      data: {
        category,
        images,
        count: images.length
      }
    });
  } catch (error) {
    console.error('Error fetching images by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images by category',
      error: error.message
    });
  }
});

// Get database statistics
router.get('/stats', (req, res) => {
  try {
    const stats = imageDB.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message
    });
  }
});

// Refresh the database (rescan media directory)
router.post('/refresh', (req, res) => {
  try {
    const images = imageDB.scanMediaDirectory();
    
    res.json({
      success: true,
      message: 'Database refreshed successfully',
      data: {
        categories: Object.keys(images),
        totalFiles: Object.values(images).reduce((sum, imgs) => sum + imgs.length, 0)
      }
    });
  } catch (error) {
    console.error('Error refreshing database:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing database',
      error: error.message
    });
  }
});

// Get specific image info
router.get('/image/:path(*)', (req, res) => {
  try {
    const imagePath = req.params.path;
    const image = imageDB.getImageByPath(imagePath);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Error fetching image info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching image info',
      error: error.message
    });
  }
});

module.exports = router;