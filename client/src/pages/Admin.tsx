import React, { useState, useEffect } from 'react';

interface ImageInfo {
  filename: string;
  path: string;
  url: string;
  size: number;
  type: 'image' | 'video';
  lastModified: string;
}

interface DatabaseStats {
  totalCategories: number;
  totalImages: number;
  totalVideos: number;
  totalSize: number;
  lastUpdated: string;
}

const Admin: React.FC = () => {
  const [images, setImages] = useState<Record<string, ImageInfo[]>>({});
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchAllImages();
  }, []);

  const fetchAllImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/database/all`);
      const data = await response.json();
      
      if (data.success) {
        setImages(data.data.images);
        setStats(data.data.stats);
        console.log('Loaded images:', data.data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDatabase = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/database/refresh`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchAllImages();
        alert('Database refreshed successfully!');
      }
    } catch (error) {
      console.error('Error refreshing database:', error);
      alert('Error refreshing database');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rich text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-display mb-8">Image Database Admin</h1>
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display">Image Database Admin</h1>
          <button
            onClick={refreshDatabase}
            className="bg-accent text-primary px-4 py-2 rounded hover:bg-accent/80 transition-colors"
          >
            Refresh Database
          </button>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary/20 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              <p className="text-2xl font-bold text-accent">{stats.totalCategories}</p>
            </div>
            <div className="bg-primary/20 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Images</h3>
              <p className="text-2xl font-bold text-accent">{stats.totalImages}</p>
            </div>
            <div className="bg-primary/20 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Videos</h3>
              <p className="text-2xl font-bold text-accent">{stats.totalVideos}</p>
            </div>
            <div className="bg-primary/20 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Total Size</h3>
              <p className="text-2xl font-bold text-accent">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Category:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-primary text-white px-4 py-2 rounded border border-secondary"
          >
            <option value="">All Categories</option>
            {Object.keys(images).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Images List */}
        <div className="space-y-6">
          {Object.entries(images)
            .filter(([category]) => !selectedCategory || category === selectedCategory)
            .map(([category, categoryImages]) => (
            <div key={category} className="bg-primary/10 p-6 rounded">
              <h2 className="text-xl font-semibold mb-4">{category} ({categoryImages.length} files)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryImages.map((image, index) => (
                  <div key={index} className="bg-primary/20 p-4 rounded">
                    <div className="aspect-video bg-secondary/20 rounded mb-3 overflow-hidden">
                      {image.type === 'image' ? (
                        <img
                          src={image.url}
                          alt={image.filename}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={image.url}
                          className="w-full h-full object-cover"
                          controls
                          muted
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="font-medium text-sm truncate">{image.filename}</p>
                      <p className="text-xs text-secondary">
                        {formatFileSize(image.size)} • {formatDate(image.lastModified)}
                      </p>
                      <p className="text-xs text-accent font-mono">{image.path}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(images).length === 0 && (
          <div className="text-center py-12">
            <p className="text-secondary">No images found. Click "Refresh Database" to scan for images.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
