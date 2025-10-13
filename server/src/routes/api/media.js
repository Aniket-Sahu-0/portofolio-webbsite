const express = require('express');
const router = express.Router();
const { getMediaTree, listImagesByPath } = require('../../services/mediaService');

// GET /api/media/tree - recursive tree of media directory
router.get('/tree', (req, res) => {
  const tree = getMediaTree();
  res.json({ success: true, tree });
});

// GET /api/media/list?path=gallery/portraits - list images in a specific subfolder
router.get('/list', (req, res) => {
  const rel = (req.query.path || '').toString().replace(/^\/+|\/+$/g, '');
  try {
    const items = listImagesByPath(rel);
    res.json({ success: true, items });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

module.exports = router;
