import { fallbackMedia, MediaCategory } from '../data/fallbackMedia';
import { ImagePresets, optimizeImageUrl } from './imageOptimizer';

export const API_BASE = (import.meta as any).env?.VITE_API_URL || ((import.meta as any).env?.PROD ? 'https://portofolio-webbsite-production.up.railway.app' : 'http://localhost:5000');
export const API_HOST = (API_BASE as string).replace(/\/api\/?$/, '');

export type MediaItem = {
  id?: string;
  url: string;
  filename?: string;
  alt?: string;
};

export type MediaPresetName = keyof typeof ImagePresets;

const categoryEndpoint: Record<MediaCategory, string> = {
  hero: '/api/database/category/heroes/home',
  intro: '/api/database/category/home/intro',
  portfolio: '/api/database/category/home/portfolio_slideshow/portraits',
  gallery: '/api/database/category/gallery/portraits',
  galleryWides: '/api/database/category/gallery/wides',
  galleryHero: '/api/database/category/heroes/gallery',
  aboutTeaser: '/api/database/category/home/about_teaser',
  about: '/api/database/category/about/approach',
  contact: '/api/database/category/contact/backgrounds',
};

export const categoryPreset: Record<MediaCategory, MediaPresetName> = {
  hero: 'hero',
  intro: 'medium',
  portfolio: 'medium',
  gallery: 'thumbnail',
  galleryWides: 'medium',
  galleryHero: 'hero',
  aboutTeaser: 'medium',
  about: 'medium',
  contact: 'medium',
};

export function toAbsoluteMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('/')) return `${API_HOST}${url}`;
  return url;
}

function normalizeImages(images: any[] = []): MediaItem[] {
  return images
    .map((item) => ({
      id: item.id || item.filename || item.url,
      url: toAbsoluteMediaUrl(item.url || item.src),
      filename: item.filename,
      alt: item.alt || item.filename,
    }))
    .filter((item) => Boolean(item.url));
}

export async function fetchMediaCategory(
  category: MediaCategory,
  signal?: AbortSignal
): Promise<MediaItem[]> {
  const endpoint = categoryEndpoint[category];
  const response = await fetch(`${API_HOST}${endpoint}`, { signal });
  if (!response.ok) throw new Error(`Failed to fetch ${category} media`);
  const json = await response.json().catch(() => ({ data: { images: [] } }));
  return normalizeImages(json.data?.images || json.images || []);
}

// Loads images straight from a media folder path (e.g. 'home/parallax'), retrying
// on transient backend failures so a momentarily slow/cold server doesn't leave the
// section blank until a manual reload. Returns [] for a genuinely empty/missing
// folder (no placeholder fallback) — these sections stay purely folder-driven.
export async function loadFolderImages(
  categoryPath: string,
  options: { limit?: number; signal?: AbortSignal; retries?: number; retryDelayMs?: number } = {}
): Promise<MediaItem[]> {
  const retries = options.retries ?? 6;
  const retryDelayMs = options.retryDelayMs ?? 600;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (options.signal?.aborted) return [];
    try {
      const res = await fetch(`${API_HOST}/api/database/category/${categoryPath}`, { signal: options.signal });
      if (!res.ok) throw new Error(`Failed to fetch ${categoryPath}`);
      const json = await res.json();
      const items = normalizeImages(json?.data?.images ?? json?.images ?? []);
      return options.limit ? items.slice(0, options.limit) : items; // success (even if empty) — done
    } catch (_) {
      if (options.signal?.aborted) return [];
      if (attempt < retries - 1) await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  return [];
}

export async function loadMediaOrFallback(
  category: MediaCategory,
  options: { limit?: number; signal?: AbortSignal; retries?: number; retryDelayMs?: number } = {}
): Promise<MediaItem[]> {
  const limit = options.limit ?? fallbackMedia[category].length;
  const retries = options.retries ?? 8;
  const retryDelayMs = options.retryDelayMs ?? 800;

  // The backend (which serves both this API and the actual media files) may not be
  // ready yet right after a restart. Retry for a few seconds before surrendering to
  // the placeholder set, so a slightly-late server is still picked up automatically
  // instead of leaving the page stuck on fallback imagery until a manual reload.
  for (let attempt = 0; attempt < retries; attempt++) {
    if (options.signal?.aborted) return [];
    try {
      const items = await fetchMediaCategory(category, options.signal);
      if (items.length > 0) return items.slice(0, limit);
      // 200 OK but the category is genuinely empty — no point retrying.
      break;
    } catch (_) {
      if (options.signal?.aborted) return [];
      if (attempt < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  }

  return fallbackMedia[category].slice(0, limit).map((url, index) => ({
    id: `${category}-fallback-${index}`,
    url,
    alt: `${category} image ${index + 1}`,
  }));
}

export function optimizedMediaUrl(
  src: string,
  category: MediaCategory,
  width?: number,
  quality?: number
): string {
  return optimizeImageUrl(src, {
    ...ImagePresets[categoryPreset[category]],
    width: width ?? ImagePresets[categoryPreset[category]].width,
    quality: quality ?? ImagePresets[categoryPreset[category]].quality,
  });
}
