const fs = require('fs');
const path = require('path');

const MEDIA_ROOT = path.join(__dirname, '../../../media');

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov']);

function ensureDefaultStructure() {
  const structure = [
    'heroes/home',
    'heroes/gallery',
    'heroes/about',
    'contact/backgrounds',
    'gallery/portraits',
    'gallery/wides',
    'about/approach',
    'home/intro',
    'home/homepage_video',
  ];
  structure.forEach(rel => {
    const full = path.join(MEDIA_ROOT, rel);
    if (!fs.existsSync(full)) fs.mkdirSync(full, { recursive: true });
  });
}

function isImageFile(file) {
  return IMAGE_EXTS.has(path.extname(file).toLowerCase());
}

function isVideoFile(file) {
  return VIDEO_EXTS.has(path.extname(file).toLowerCase());
}

function walkDir(dir, baseUrl) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push({
        type: 'dir',
        name: entry.name,
        children: walkDir(full, `${baseUrl}/${encodeURIComponent(entry.name)}`),
      });
    } else if (entry.isFile() && (isImageFile(entry.name) || isVideoFile(entry.name))) {
      results.push({
        type: 'file',
        name: entry.name,
        url: `${baseUrl}/${encodeURIComponent(entry.name)}`,
      });
    }
  }
  return results;
}

function getMediaTree() {
  ensureDefaultStructure();
  return walkDir(MEDIA_ROOT, '/media');
}

function listImagesByPath(relPath) {
  ensureDefaultStructure();
  const target = path.join(MEDIA_ROOT, relPath);
  if (!target.startsWith(MEDIA_ROOT)) {
    throw new Error('Invalid path');
  }
  if (!fs.existsSync(target)) return [];
  const files = fs.readdirSync(target, { withFileTypes: true });
  const baseUrl = `/media/${relPath.split('/').map(encodeURIComponent).join('/')}`;
  const media = files
    .filter(d => d.isFile() && (isImageFile(d.name) || isVideoFile(d.name)))
    .map((d) => ({
      filename: d.name,
      url: `${baseUrl}/${encodeURIComponent(d.name)}`,
      type: isVideoFile(d.name) ? 'video' : 'image',
    }));
  return media;
}

module.exports = {
  MEDIA_ROOT,
  getMediaTree,
  listImagesByPath,
  ensureDefaultStructure,
};
