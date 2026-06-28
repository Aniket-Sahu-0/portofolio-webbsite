const express = require('express');
const router = express.Router();
const ImageDatabase = require('../../database/imageDatabase');

const imageDB = new ImageDatabase();

router.get('/all', async (req, res) => {
  try {
    const images = await imageDB.getAllImages();
    const stats = await imageDB.getStats();
    res.json({ success: true, data: { images, stats } });
  } catch (error) {
    console.error('Error fetching all images:', error);
    res.status(500).json({ success: false, message: 'Error fetching images', error: error.message });
  }
});

router.get('/category/:category(*)', async (req, res) => {
  try {
    const { category } = req.params;
    const images = await imageDB.getImagesByCategory(category);
    res.json({ success: true, data: { category, images, count: images.length } });
  } catch (error) {
    console.error('Error fetching images by category:', error);
    res.status(500).json({ success: false, message: 'Error fetching images by category', error: error.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const stats = await imageDB.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const images = await imageDB.scanMediaDirectory();
    res.json({
      success: true,
      message: 'Database refreshed successfully',
      data: {
        categories: Object.keys(images),
        totalFiles: Object.values(images).reduce((sum, imgs) => sum + imgs.length, 0),
      },
    });
  } catch (error) {
    console.error('Error refreshing database:', error);
    res.status(500).json({ success: false, message: 'Error refreshing database', error: error.message });
  }
});

module.exports = router;
