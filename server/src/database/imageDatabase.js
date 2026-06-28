const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Images were uploaded inside a "media/" root folder in Cloudinary.
// asset_folder = "media/heroes/home", public_id = "IMG_7823_j5allh"
// We strip the "media/" prefix from asset_folder so callers see "heroes/home" as before.
function mapResource(r) {
  const filename = r.filename + '.' + r.format;
  const folder = (r.asset_folder || '').replace(/^media\/?/, ''); // strip "media/" prefix
  return {
    filename,
    path: folder ? `${folder}/${filename}` : filename,
    url: r.secure_url,
    size: r.bytes,
    type: r.resource_type === 'video' ? 'video' : 'image',
    extension: '.' + r.format,
  };
}

class ImageDatabase {
  constructor() {
    this.cache = {};
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.cacheTimestamps = {};
  }

  _isCacheValid(key) {
    const ts = this.cacheTimestamps[key];
    return ts && Date.now() - ts < this.cacheTTL;
  }

  async _search(expression) {
    const resources = [];
    let nextCursor = null;
    do {
      const q = cloudinary.search
        .expression(expression)
        .sort_by('public_id', 'asc')
        .max_results(500);
      if (nextCursor) q.next_cursor(nextCursor);
      const result = await q.execute();
      resources.push(...result.resources);
      nextCursor = result.next_cursor || null;
    } while (nextCursor);
    return resources;
  }

  async getImagesByCategory(folder) {
    if (this._isCacheValid(folder)) return this.cache[folder];
    // folder = "heroes/home", Cloudinary stores it as "media/heroes/home"
    const cloudFolder = `media/${folder}`;
    const resources = await this._search(`folder="${cloudFolder}"`);
    const images = resources.map(mapResource);
    this.cache[folder] = images;
    this.cacheTimestamps[folder] = Date.now();
    return images;
  }

  async getAllImages() {
    const cacheKey = '__all__';
    if (this._isCacheValid(cacheKey)) return this.cache[cacheKey];
    const resources = await this._search('folder:media/*');
    const categories = {};
    resources.forEach((r) => {
      const img = mapResource(r);
      const folder = (r.asset_folder || '').replace(/^media\/?/, '');
      if (!categories[folder]) categories[folder] = [];
      categories[folder].push(img);
    });
    this.cache[cacheKey] = categories;
    this.cacheTimestamps[cacheKey] = Date.now();
    return categories;
  }

  async getStats() {
    const all = await this.getAllImages();
    let totalImages = 0, totalSize = 0;
    Object.values(all).forEach((imgs) => {
      totalImages += imgs.length;
      imgs.forEach((img) => (totalSize += img.size));
    });
    return {
      totalCategories: Object.keys(all).length,
      totalImages,
      totalVideos: 0,
      totalSize,
      lastUpdated: new Date().toISOString(),
    };
  }

  async scanMediaDirectory() {
    return this.getAllImages();
  }
}

module.exports = ImageDatabase;
