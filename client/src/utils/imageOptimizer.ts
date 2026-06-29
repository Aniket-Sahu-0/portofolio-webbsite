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

  // Encode spaces so URLs with filenames like "IMG_9546 (1).webp" don't break
  // srcSet parsing (spaces are candidate delimiters there).
  url = url.replace(/ /g, '%20');

  const { quality = 80, width, format } = options;

  // Cloudinary optimizes via URL *path* transforms — it ignores query params.
  //   f_auto = best format per browser (AVIF/WebP), q_auto = smart quality,
  //   w_<n> + c_limit = cap width without upscaling.
  // This turns ~2MB originals into ~70KB with no visible quality loss.
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const t = ['f_auto', 'q_auto'];
    if (width) t.push(`w_${width}`, 'c_limit');
    return url.replace('/upload/', `/upload/${t.join(',')}/`);
  }

  // Don't optimize other external URLs (e.g. Unsplash fallback images)
  if (url.startsWith('http') && !url.includes('localhost')) {
    return url;
  }
  
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
