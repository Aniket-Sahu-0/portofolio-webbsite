const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Image optimization middleware using sharp.
 *
 * Resizes/compresses images on-the-fly, but caches every variant to disk so a
 * given (image + width + quality + format) is only ever processed by sharp once.
 * Without this, a single gallery page load re-runs dozens of CPU-heavy transforms
 * against multi-MB originals on every request, which saturates the event loop and
 * causes the browser to reset in-flight connections (broken images).
 */

const mediaRoot = path.resolve(__dirname, '../../../media');
const cacheRoot = path.resolve(__dirname, '../../cache/images');

// Ensure the cache directory exists up front.
fs.mkdirSync(cacheRoot, { recursive: true });

// Keep libvips from grabbing every core for a single request; this leaves
// headroom for static file serving so large originals don't stall under load.
sharp.concurrency(Math.max(1, Math.min(2, require('os').cpus().length - 1)));

// Simple in-process queue so a burst of first-time variants doesn't all hit
// sharp at once. Cached hits bypass this entirely.
const MAX_CONCURRENT_TRANSFORMS = 3;
let activeTransforms = 0;
const waiting = [];

function acquireSlot() {
  if (activeTransforms < MAX_CONCURRENT_TRANSFORMS) {
    activeTransforms += 1;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
}

function releaseSlot() {
  activeTransforms -= 1;
  const next = waiting.shift();
  if (next) {
    activeTransforms += 1;
    next();
  }
}

const imageOptimizer = async (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

  if (!imageExtensions.includes(ext)) {
    return next();
  }

  const quality = parseInt(req.query.q) || 80;
  const width = parseInt(req.query.w) || null;
  const format = req.query.f || null;

  // No optimization requested -> let express.static serve the original.
  if (!req.query.q && !req.query.w && !req.query.f) {
    return next();
  }

  const decodedPath = decodeURIComponent(req.path);
  const filePath = path.resolve(mediaRoot, `.${decodedPath}`);

  // Path traversal guard.
  if (!filePath.startsWith(mediaRoot)) {
    return res.status(400).json({ success: false, message: 'Invalid image path' });
  }

  let sourceStat;
  try {
    sourceStat = fs.statSync(filePath);
  } catch (_) {
    return next(); // file doesn't exist -> static layer will 404
  }

  const outputFormat = format === 'jpg' ? 'jpeg' : format;
  const outExt = outputFormat === 'webp' ? 'webp' : outputFormat === 'jpeg' ? 'jpg' : ext.slice(1);
  const contentType = outExt === 'webp' ? 'image/webp' : outExt === 'png' ? 'image/png' : 'image/jpeg';

  // Cache key includes source mtime+size so edits to an image bust the cache.
  const keySource = `${decodedPath}|w=${width}|q=${quality}|f=${outputFormat}|m=${sourceStat.mtimeMs}|s=${sourceStat.size}`;
  const hash = crypto.createHash('md5').update(keySource).digest('hex');
  const cachePath = path.join(cacheRoot, `${hash}.${outExt}`);

  const sendCached = () => {
    res.type(contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    fs.createReadStream(cachePath)
      .on('error', () => next())
      .pipe(res);
  };

  // Cache hit -> serve immediately, no sharp work.
  if (fs.existsSync(cachePath)) {
    return sendCached();
  }

  await acquireSlot();
  try {
    // Another request may have produced it while we waited for a slot.
    if (fs.existsSync(cachePath)) {
      return sendCached();
    }

    let image = sharp(filePath, { failOn: 'none' }).rotate();
    const metadata = await image.metadata();

    if (width && metadata.width && width < metadata.width) {
      image = image.resize(width, null, { fit: 'inside', withoutEnlargement: true });
    }

    if (outputFormat === 'webp') {
      image = image.webp({ quality });
    } else if (outputFormat === 'jpeg') {
      image = image.jpeg({ quality, progressive: true, mozjpeg: true });
    } else if (ext === '.png') {
      image = image.png({ quality });
    } else if (ext === '.webp') {
      image = image.webp({ quality });
    } else {
      image = image.jpeg({ quality, progressive: true, mozjpeg: true });
    }

    const buffer = await image.toBuffer();

    // Write atomically so partial files are never served from cache.
    const tmpPath = `${cachePath}.${process.pid}.tmp`;
    fs.writeFile(tmpPath, buffer, (writeErr) => {
      if (!writeErr) {
        fs.rename(tmpPath, cachePath, () => {});
      } else {
        fs.unlink(tmpPath, () => {});
      }
    });

    res.type(contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.end(buffer);
  } catch (error) {
    console.error('Image optimization error:', error.message);
    next();
  } finally {
    releaseSlot();
  }
};

module.exports = imageOptimizer;
