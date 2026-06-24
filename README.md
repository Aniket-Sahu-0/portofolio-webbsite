# The Wedding Shade — Photographer Portfolio

Cinematic wedding photography portfolio for Mohit. Dark editorial aesthetic, scroll-driven
interactions, stacked card deck, parallax sections, and a 3D portrait flip on the About page.

**Stack:** React 18 + TypeScript + Vite + Tailwind · Framer Motion · Lenis · Node/Express

---

## Quick Start

```bash
npm run dev          # starts client :3000 + server :5000
npm run dev:client   # frontend only
npm run dev:server   # backend only
```

Requires Node 18+. Copy `server/.env.example` → `server/.env` before first run.

---

## Project Structure

```
├── client/src/
│   ├── App.tsx                  # Router + conditional Lenis mount
│   ├── pages/                   # Home, About, Gallery, Contact, Admin
│   └── components/
│       ├── home/
│       │   ├── HomeHero.tsx     # Auto-playing full-screen slideshow
│       │   ├── HomeIntro.tsx    # 300vh scroll-driven 3-panel story
│       │   ├── HomeGalleryStrip.tsx  # Infinite dual-row marquee
│       │   ├── HomeParallax.tsx # Fixed-bg bridal photo + quote + stats
│       │   └── HomeServices.tsx # 425vh stacked card deck (4 panels)
│       ├── Navbar.tsx
│       └── media/OptimizedImage.tsx  # ?w=&q=&f=webp server transforms
│
├── server/src/
│   ├── index.js                 # Express entry, serves /media static
│   ├── database/imageDatabase.js  # Scans media/ → JSON catalogue
│   ├── routes/api/media.js      # GET /api/database/category/:cat/:sub
│   ├── routes/api/contact.js    # POST /api/contact (email)
│   └── middleware/imageOptimizer.js  # Sharp image transforms
│
├── media/                       # LOCAL ONLY — gitignored, never in git
│   ├── heroes/home/
│   ├── gallery/portraits/
│   ├── gallery/weddings/
│   ├── about/approach/
│   └── contact/backgrounds/
│
└── server/data/images.json      # Auto-generated file catalogue (no photo data)
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
- `media/` is always gitignored — photos stay local or go to cloud storage in production
- Image API shape: `GET /api/database/category/{category}/{subcategory}`
  → `{ success, data: { images: [{ url, filename, size }] } }`

---

## Environment Variables

**`server/.env`**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-user
SMTP_PASS=your-ethereal-pass
EMAIL_TO=your@email.com
```

**`client/.env`** (optional, defaults to localhost)
```env
VITE_API_URL=http://localhost:5000
```

---

## Adding Photos

Drop images into the correct `media/` subfolder and restart the server —
`imageDatabase.js` rescans on startup and rebuilds `server/data/images.json`.

```
media/heroes/home/         → homepage hero slideshow
media/about/approach/      → photographer portrait (About flip card)
media/gallery/portraits/   → portraits gallery + HomeParallax background
media/gallery/weddings/    → weddings gallery
media/contact/backgrounds/ → contact page background
```

---

## Deployment

The project needs two hosting targets:

| Part | Recommended | Notes |
|------|-------------|-------|
| Frontend | Vercel | Set `VITE_API_URL` env var to backend URL |
| Backend | Railway / Render | Needs persistent filesystem for `media/` |
| Photos | Cloudinary (free 25 GB) | Replace local `media/` in production |

See `CLAUDE.md` for full architecture detail and `server/data/images.json` structure.
