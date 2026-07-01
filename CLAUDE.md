# The Wedding Shade — Project Context

Wedding photography portfolio for Mohit (photographer). Dark, cinematic aesthetic.

**LIVE in production** at **https://theweddingshade.com**
- **Frontend → Vercel** (static build of `client/`), tracks the `main` branch
- **Backend → Railway** (Express, root dir `server/`), tracks `main`, public URL
  `https://portofolio-webbsite-production.up.railway.app`
- **Media → Cloudinary** CDN (cloud name `djh2c4bgu`) — all photos live there, not in git

**Workflow:** `main` is the production branch. Push to `main` → **both** Vercel and
Railway auto-deploy (~1–2 min). Verify a Vercel deploy by curling the live JS bundle
(`https://theweddingshade.com` → grep `assets/index-*.js`) for expected strings.

Client (React/Vite) on port 3000, server (Express) on port 5000.
Run both: `npm run dev` from root (uses concurrently).

---

## Tech Stack

**Frontend** `client/`
- React 18 + TypeScript, Vite, Tailwind CSS
- Framer Motion — scroll animations, spring physics, the desktop stacked panels
- Lenis (`lenis/react`) — smooth wheel scroll on all non-home routes
- React Router v6

**Backend** `server/`
- Express + Node.js (**requires Node ≥18** — see `engines` in `server/package.json`;
  Railway/Railpack otherwise picks Node 14 + npm 6, which can't parse lockfileVersion 3)
- **Cloudinary SDK** — `imageDatabase.js` fetches the image catalogue from Cloudinary
  by folder (no local `media/` scanning, no `sharp`). 5-minute in-memory cache.
- Nodemailer for contact-form emails (SMTP currently unconfigured → contact emails
  disabled; the front-end contact form uses EmailJS directly)

---

## File Structure

```
portofolio-webbsite/
├── client/src/
│   ├── App.tsx                        # Router + conditional Lenis mount (non-home only)
│   ├── pages/
│   │   ├── Home.tsx                   # Assembles home sections + PageLoader
│   │   ├── About.tsx                  # Full about page (flip card + testimonials + MOHIT watermark)
│   │   ├── Gallery.tsx                # Masonry grid (2-col mobile / 3-col desktop) + infinite scroll
│   │   ├── Contact.tsx
│   │   └── Admin.tsx
│   ├── components/
│   │   ├── Navbar.tsx                 # Sticky nav, mobile hamburger menu (solid bg)
│   │   ├── Footer.tsx                 # Modern centered footer + giant faded name watermark
│   │   ├── StatsSection.tsx           # Editorial "By the numbers" band (500+/5k+/100%)
│   │   ├── PageLoader.tsx             # Branded first-paint loader (gates home until hero loads)
│   │   ├── ScrollOnRouteChange.tsx
│   │   ├── home/
│   │   │   ├── HomeHero.tsx           # KT-Merry-style hero (statement + CTA) over full-bleed slideshow
│   │   │   ├── HomeIntro.tsx          # Desktop: 300vh scrub scene · Mobile: static stacked panels
│   │   │   ├── HomeGalleryStrip.tsx   # Infinite marquee gallery (2 rows)
│   │   │   ├── HomeParallax.tsx       # Bridal photo + quote + stats
│   │   │   ├── HomeServices.tsx       # Desktop: wheel-driven card deck · Mobile: static stacked cards
│   │   │   └── MobileReveal.tsx       # Static wrapper for the mobile stacked layouts (no motion)
│   │   └── media/
│   │       └── OptimizedImage.tsx     # <img> whose src/srcSet run through optimizeImageUrl
│   ├── utils/
│   │   ├── media.ts                   # API_BASE/API_HOST, loadMediaOrFallback(), loadFolderImages()
│   │   ├── imageOptimizer.ts          # optimizeImageUrl() — injects Cloudinary path transforms
│   │   └── useIsTouch.ts              # Touch detection (resolved once); drives mobile/desktop split
│   ├── data/
│   │   └── fallbackMedia.ts           # Static Unsplash fallbacks if the API fails
│   └── config/
│       └── animation.ts
│
├── server/src/
│   ├── index.js                       # Express entry (API only — no /media static serving)
│   ├── database/
│   │   └── imageDatabase.js           # Fetches image catalogue from Cloudinary (media/ root), 5-min cache
│   ├── routes/api/
│   │   ├── index.js                   # /api router
│   │   ├── media.js                   # GET /api/database/category/:path (async)
│   │   └── contact.js                 # POST /api/contact (email)
│   └── services/
│       ├── email.service.js
│       └── mediaService.js
│
├── server/data/images.json            # Legacy catalogue file (Cloudinary is the live source now)
└── CLAUDE.md                          # This file
```

Note: `sharp` and the old `server/src/middleware/imageOptimizer.js` (on-the-fly sharp
transforms) were removed — Cloudinary handles all resizing/format via URL transforms.

---

## Responsive split — mobile vs desktop (important)

The home page's two scroll-driven sections branch on **touch capability**
(`useIsTouch()`), NOT viewport width — because the desktop experiences depend on wheel
hijacking / scroll-scrubbing that only make sense with a pointer:

- **HomeIntro** — Desktop: 300vh sticky scrub scene (spring-smoothed cross-fading
  panels). Touch: plain **static stacked panels** in normal document flow (editorial
  header + image pair + text), no scrub, no animation.
- **HomeServices** — Desktop: wheel-driven stacked **card deck** (one gesture = one
  panel). Touch: **static stacked cards** in normal flow, no hijacking.
- **HomeHero** — same centered layout on all sizes, but loads **portrait images on
  touch** (`heroes/home_mobile/`, falling back to `heroes/home/`).

`MobileReveal` is the (intentionally motion-free) wrapper for these mobile layouts — the
client explicitly wanted zero animation on mobile to avoid any laggy feel.

**Editing HomeIntro/HomeServices means touching BOTH render paths.** `useIsTouch` has a
`?forceTouch` dev override you can temporarily add to preview the mobile path on a
desktop browser — remove before committing.

---

## Site Architecture — Page by Page

### Home (`/`)

No Lenis on Home (wheel hijacking owns pointer input on desktop; mobile is native
scroll on static stacks). `PageLoader` covers the first paint until the hero image loads
(4s safety timeout).

1. **HomeHero** — Full-bleed auto-advancing slideshow. Centered, KT-Merry editorial
   style: small tracked label ("Wedding Photography & Film") → serif statement headline
   ("Cinematic stories of the day that matters") → one-line tagline → a single gold
   "Browse Portfolio" outline button → a "Scroll" cue. Uses `100svh` so the cue sits in
   view on mobile. Lighter image scrims (photo is the focus).

2. **HomeIntro** — Story / Moments / Together (see Responsive split above).

3. **HomeGalleryStrip** — Two rows, infinite CSS marquee, opposite directions.

4. **HomeParallax** — Bridal portrait + quote + stats.

5. **HomeServices** — Services / Approach / Notes / Bookings (see Responsive split).
   Cards: 0 Services, 1 Approach, 2 Notes (cream, client quotes — names removed), 3 Bookings.

**StatsSection** (editorial "By the numbers" band) + **Footer** render below (excluded on `/about`).

### About (`/about`)

Lenis active. Hero + 3D flip portrait card, services grid, 4 hover-flip testimonials
(couples: Ishaa & Archit, Priya & Sarthak, Shubham & Harshita, Gulshan & Suman),
thoughts/CTA, and a giant faded "MOHIT" watermark. StatsSection/Footer hidden here.

### Gallery (`/gallery`)

Height-aware masonry: **2 columns on phones + tablets, 3 on desktop** (`< 1024px → 2`),
tight 4px gutters near the screen edges, infinite scroll (reveal 12 then +8 on a
sentinel). Hero is a static optimized `<img>` (no `background-attachment: fixed` and no
scroll parallax — both caused mobile stutter/vibration).

---

## Image pipeline (Cloudinary)

```
OptimizedImage / bg URLs → optimizeImageUrl() injects Cloudinary PATH transforms
  https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_<n>,c_limit/v.../file.webp
```
- Cloudinary **ignores query params** — transforms go in the URL path after `/upload/`.
  `f_auto` (AVIF/WebP), `q_auto` (smart quality), `w_<n>` + `c_limit` (cap width). This
  turns ~2MB originals into ~70KB.
- API shape: `GET /api/database/category/<folder/path>` →
  `{ success, data: { category, images: [{ filename, url, path, size }] } }`.
  `url` is a full Cloudinary `secure_url`.
- `API_BASE` (`media.ts` + About/Contact/Admin) = `VITE_API_URL` if set, else the Railway
  URL in production (`import.meta.env.PROD`), else `localhost:5000`. This is why the site
  works even if the Vercel env var is missing.

**Tailwind quirk:** only opacity classes whose value is in the default scale AND appear
literally in source compile (e.g. `bg-primary/98` silently produced NO css → transparent;
use solid `bg-primary`). Watch for this when using `/NN` opacity.

---

## Design Tokens (Tailwind)

```
primary   #0a0a0a   Deep black — main backgrounds
secondary #1a1a1a   Charcoal — card/section backgrounds
accent    #8b7355   Dark bronze/gold — buttons, highlights, accents
light     #f5f5f5   Off-white — main body text
muted     #888888   Medium gray — secondary text
border    #333333   Dark gray — dividers
```
Fonts: `Cormorant Garamond` (serif/display), `Helvetica Neue` (sans/body).

---

## Media folders → site sections (Cloudinary)

All photos live in Cloudinary under a **`media/` root folder** (e.g.
`media/heroes/home`). `imageDatabase.js` prepends `media/` to lookups and strips it from
returned paths, so the app/table below use paths WITHOUT the `media/` prefix. Cloudinary
`asset_folder` holds the path; `public_id` is the bare filename. Images are served
**sorted by filename** — prefix `01-`, `02-` to control order. Empty folder = graceful
dark frame. Changes appear within the 5-minute server cache (no redeploy).

| Folder | Feeds | Reads |
|--------|-------|-------|
| `heroes/home/` | HomeHero slideshow (desktop + fallback) | first 5 (Unsplash fallback) |
| `heroes/home_mobile/` | HomeHero **on touch/phones** — portrait images | first 5; falls back to `heroes/home` |
| `home/about_teaser/` | HomeIntro story panels | first 6 (2 per panel) |
| `home/portfolio_slideshow/portraits/` | HomeGalleryStrip marquee | first 20 |
| `home/parallax/` | HomeParallax background | first 1 |
| `home/approach/` | HomeServices · Approach | first 1 |
| `home/notes/` | HomeServices · Notes card backgrounds | first 2 |
| `home/bookings/` | HomeServices · Bookings | first 1 |
| `about/portrait/` | About flip-card portrait | first 1 |
| `about/testimonials/` | About testimonial cards | first 4 |
| `gallery/portraits/` | Gallery main grid | up to 500 (Unsplash fallback) |
| `gallery/wides/` | Gallery wide row | up to 500 (Unsplash fallback) |
| `heroes/gallery/` | Gallery page hero | first 1 |
| `contact/backgrounds/` | Contact page background | first 1 |

Loaders in `client/src/utils/media.ts`:
- `loadMediaOrFallback(category)` — retries, then Unsplash fallback (HomeHero + Gallery).
- `loadFolderImages(folderPath)` — retries, returns **empty** on failure/empty (no Unsplash).

---

## Rate limiting

Single per-IP API limiter (`server/src/index.js`): `/api/*` — `RATE_LIMIT_MAX`, default
**100**/15 min in prod (1000 in dev). There is no `/media` limiter anymore — photos are
served by the Cloudinary CDN, not this server.

---

## Running Locally

```bash
npm run dev              # starts both client (3000) and server (5000)
npm run dev:client       # client only
npm run dev:server       # server only
```

`server/.env` needs: `PORT=5000`, `CLIENT_URL=http://localhost:3000`, and the
**Cloudinary** creds: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
`CLOUDINARY_API_SECRET`. `.env` is gitignored.

---

## Deployment (LIVE)

- **Vercel** (frontend): tracks `main`, Root Directory **empty** (`vercel.json` runs
  `cd client && npm run build` + SPA rewrite). Env `VITE_API_URL` = Railway URL. To force
  a clean rebuild, push a commit (dashboard "Redeploy" reuses the build cache and can
  ship a stale bundle — a real gotcha we hit).
- **Railway** (backend): tracks `main`, Root Directory `server`, start `node src/index.js`.
  Env: `NODE_ENV=production`, `PORT`, `CLIENT_URL` = comma-separated live origins
  (`https://theweddingshade.com,https://www.theweddingshade.com`) for CORS, plus the
  Cloudinary creds. `config.js` splits `CLIENT_URL` on commas.
- **Cloudinary** (media): upload to the `media/...` folder tree above.

**Verification note:** the Claude preview screenshot tool times out on the home page
(continuous slideshow/marquee animation never reaches a stable paint) — verify via
`preview_eval` DOM checks + `curl` instead of screenshots.
