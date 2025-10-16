/**
 * Image optimization utility
 * Adds query parameters to optimize images on-the-fly
 */

export interface ImageOptimizationOptions {
  quality?: number; // 1-100, default 80
  width?: number;   // Max width in pixels
  format?: 'webp' | 'jpeg' | 'jpg';
}

/**
 * Optimize an image URL by adding query parameters
 * @param url - The original image URL
 * @param options - Optimization options
 * @returns Optimized URL with query parameters
 */
export function optimizeImageUrl(url: string, options: ImageOptimizationOptions = {}): string {
  if (!url) return url;
  
  // Don't optimize external URLs
  if (url.startsWith('http') && !url.includes('localhost')) {
    return url;
  }

  const { quality = 80, width, format } = options;
  
  const params = new URLSearchParams();
  if (quality && quality !== 100) params.append('q', quality.toString());
  if (width) params.append('w', width.toString());
  if (format) params.append('f', format);

  const queryString = params.toString();
  if (!queryString) return url;

  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${queryString}`;
}

/**
 * Preset optimization profiles for different use cases
 */
export const ImagePresets = {
  // Hero/large images - use JPEG for smoother look
  hero: { quality: 82, width: 1920, format: 'jpeg' as const },
  
  // Gallery thumbnails - smaller and lower quality for faster loading
  thumbnail: { quality: 70, width: 600, format: 'jpeg' as const },
  
  // Medium images
  medium: { quality: 75, width: 1000, format: 'jpeg' as const },
  
  // Small images
  small: { quality: 70, width: 500, format: 'jpeg' as const },
  
  // High quality (minimal compression)
  highQuality: { quality: 88, width: 2400, format: 'jpeg' as const },
};

/**
 * Apply a preset to an image URL
 */
export function applyPreset(url: string, preset: keyof typeof ImagePresets): string {
  return optimizeImageUrl(url, ImagePresets[preset]);
}
