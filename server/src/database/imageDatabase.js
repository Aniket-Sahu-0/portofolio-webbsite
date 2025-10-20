const fs = require('fs');
const path = require('path');

class ImageDatabase {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data/images.json');
    this.mediaPath = path.join(__dirname, '../../../media'); // Fixed path
    this.ensureDataDirectory();
    this.loadDatabase();
  }

  ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  loadDatabase() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const data = fs.readFileSync(this.dbPath, 'utf8');
        this.database = JSON.parse(data);
      } else {
        this.database = {
          images: {},
          lastUpdated: new Date().toISOString()
        };
        this.saveDatabase();
      }
    } catch (error) {
      console.error('Error loading image database:', error);
      this.database = {
        images: {},
        lastUpdated: new Date().toISOString()
      };
    }
  }

  saveDatabase() {
    try {
      this.database.lastUpdated = new Date().toISOString();
      fs.writeFileSync(this.dbPath, JSON.stringify(this.database, null, 2));
    } catch (error) {
      console.error('Error saving image database:', error);
    }
  }

  scanMediaDirectory() {
    const categories = {};
    
    const scanDirectory = (dir, relativePath = '') => {
      if (!fs.existsSync(dir)) return;
      
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;
        
        if (fs.statSync(fullPath).isDirectory()) {
          scanDirectory(fullPath, itemRelativePath);
        } else {
          const ext = path.extname(item).toLowerCase();
          if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm', '.mov'].includes(ext)) {
            if (!categories[relativePath]) {
              categories[relativePath] = [];
            }
            
            const imageInfo = {
              filename: item,
              path: itemRelativePath,
              fullPath: fullPath,
              url: `/media/${itemRelativePath}`,
              size: fs.statSync(fullPath).size,
              lastModified: fs.statSync(fullPath).mtime.toISOString(),
              type: ext === '.mp4' || ext === '.webm' || ext === '.mov' ? 'video' : 'image',
              extension: ext
            };
            
            categories[relativePath].push(imageInfo);
          }
        }
      });
    };

    scanDirectory(this.mediaPath);
    
    // Sort images by filename for consistent ordering
    Object.keys(categories).forEach(category => {
      categories[category].sort((a, b) => a.filename.localeCompare(b.filename));
    });

    this.database.images = categories;
    this.saveDatabase();
    
    return categories;
  }

  getImagesByCategory(category) {
    this.scanMediaDirectory(); // Refresh the database
    return this.database.images[category] || [];
  }

  getAllImages() {
    this.scanMediaDirectory(); // Refresh the database
    return this.database.images;
  }

  getImageByPath(imagePath) {
    this.scanMediaDirectory(); // Refresh the database
    
    for (const category in this.database.images) {
      const image = this.database.images[category].find(img => img.path === imagePath);
      if (image) return image;
    }
    return null;
  }

  // Get statistics
  getStats() {
    this.scanMediaDirectory();
    const stats = {
      totalCategories: Object.keys(this.database.images).length,
      totalImages: 0,
      totalVideos: 0,
      totalSize: 0,
      lastUpdated: this.database.lastUpdated
    };

    Object.values(this.database.images).forEach(images => {
      images.forEach(img => {
        stats.totalSize += img.size;
        if (img.type === 'video') {
          stats.totalVideos++;
        } else {
          stats.totalImages++;
        }
      });
    });

    stats.totalFiles = stats.totalImages + stats.totalVideos;
    return stats;
  }
}

module.exports = ImageDatabase;
