# Performance

## Image Delivery — Cloudinary CDN

All images are served from Cloudinary's global CDN. No server-side processing needed.

Cloudinary handles automatically:
- WebP conversion
- Compression and quality tuning
- Responsive resizing via URL parameters
- Global edge caching

**To resize or compress an image via URL**, append Cloudinary transformation params:
```
https://res.cloudinary.com/<cloud>/image/upload/w_1920,q_80,f_webp/v.../image.jpg
```

The frontend currently uses the raw `secure_url` from the API. If you want automatic transforms, update `OptimizedImage.tsx` to inject Cloudinary URL params instead of the old `?w=&q=&f=` query string approach.

## Frontend

- **Lazy loading** — gallery images load only when scrolled into view
- **Infinite marquee** — CSS-only animation, no JS scroll listeners
- **Framer Motion springs** — hardware-accelerated transforms only (`translate`, `scale`, `opacity`)
- **`contain: paint style`** on HomeServices panels — limits browser repaint scope
- **`willChange: transform`** on animated panels — promotes to GPU layer

## Server

- **5-minute in-memory cache** on Cloudinary API responses — repeated folder fetches within 5 min hit the cache, not Cloudinary's API
- **Rate limiting** on `/api/*` — 100 req / 15 min per IP in production

## Deployment

- **Frontend (Vercel)** — built static files served from Vercel's global CDN
- **Backend (Railway)** — single Node.js process, single region
- **Images (Cloudinary)** — global CDN, independent of backend region

## Further Optimizations (if needed)

- Inject Cloudinary transforms into image URLs (resize to display width before delivery)
- Increase Cloudinary cache TTL in `imageDatabase.js` (`cacheTTL`) beyond 5 minutes
- Add a `stale-while-revalidate` header on API responses
