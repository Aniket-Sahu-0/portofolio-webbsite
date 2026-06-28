# The Wedding Shade — Photographer Portfolio

Cinematic wedding photography portfolio for Mohit. Dark editorial aesthetic, scroll-driven
interactions, stacked card deck, parallax sections, and a 3D portrait flip on the About page.

**Stack:** React 18 + TypeScript + Vite + Tailwind · Framer Motion · Lenis · Node/Express · Cloudinary

---

## Quick Start

```bash
npm run dev          # starts client :3000 + server :5000
npm run dev:client   # frontend only
npm run dev:server   # backend only
```

Requires Node 18+. Copy `server/.env.example` → `server/.env` and fill in your Cloudinary credentials before first run.

---

## Project Structure

```
├── client/src/
│   ├── App.tsx                  # Router + conditional Lenis mount
│   ├── pages/                   # Home, About, Gallery, Contact, Admin
│   └── components/
│       ├── home/
│       │   ├── HomeHero.tsx          # Auto-playing full-screen slideshow
│       │   ├── HomeIntro.tsx         # 300vh scroll-driven 3-panel story
│       │   ├── HomeGalleryStrip.tsx  # Infinite dual-row marquee
│       │   ├── HomeParallax.tsx      # Fixed-bg bridal photo + quote + stats
│       │   └── HomeServices.tsx      # 425vh stacked card deck (4 panels)
│       ├── Navbar.tsx
│       └── media/OptimizedImage.tsx
│
├── server/src/
│   ├── index.js                 # Express entry point
│   ├── database/imageDatabase.js  # Fetches images from Cloudinary by folder
│   ├── routes/api/media.js      # GET /api/database/category/:path
│   └── routes/api/contact.js    # POST /api/contact (email)
│
└── server/data/images.json      # Auto-generated catalogue (filenames only)
```

---

## Key Features

### Home page
- **Hero** — slideshow with crossfade, dot navigation
- **Intro** — 300 vh scroll scene, 3 panels with overlapping image pairs
- **Gallery strip** — infinite marquee, 2 rows moving in opposite directions
- **Parallax** — `background-attachment: fixed` bridal portrait, quote, stats
- **Services** — stacked card deck: one wheel gesture = one panel advance (desktop);
  scroll-position driven on mobile. 4 cards: Services / Approach / Notes / Bookings

### About page
- **Portrait flip** — 3D card flip driven by wheel scroll (desktop, with Lenis scroll lock)
  or auto-played after 800 ms (mobile). Spring physics: `stiffness 100, damping 26`.
- Services grid, hover-flip testimonial cards, thoughts/CTA

### Architecture notes
- Lenis smooth scroll is mounted only on non-home routes to avoid conflicts with
  the stacked panels' wheel hijacking
- All images are stored in **Cloudinary** and served via CDN — no local `media/` folder in production
- Image API shape: `GET /api/database/category/{folder/path}`
  → `{ success, data: { images: [{ url, filename, size }] } }`

---

## Environment Variables

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**`client/.env`** (optional, defaults to localhost)
```env
VITE_API_URL=http://localhost:5000
```

---

## Adding Photos

Upload images to the correct folder in Cloudinary — the server fetches them live on each request (5-minute cache). See `MEDIA_SETUP_GUIDE.md` for the full folder map.

---

## Deployment

| Part | Host | Notes |
|------|------|-------|
| Frontend | Vercel | Set `VITE_API_URL` to your Railway backend URL |
| Backend | Railway | Set all env vars in Railway dashboard |
| Photos | Cloudinary | Already set up — upload to the `media/` folder tree |

See `MEDIA_SETUP_GUIDE.md` for Cloudinary folder structure and `CLAUDE.md` for full architecture detail.
