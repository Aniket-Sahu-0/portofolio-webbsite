# The Wedding Shade — Project Context

Wedding photography portfolio for Mohit (photographer). Dark, cinematic aesthetic.
Client (React/Vite) on port 3000, server (Express) on port 5000.
Run both: `npm run dev` from root (uses concurrently).

---

## Tech Stack

**Frontend** `client/`
- React 18 + TypeScript, Vite, Tailwind CSS
- Framer Motion — scroll animations, spring physics, stacked panels
- Lenis (`lenis/react`) — smooth scroll on all non-home routes
- React Router v6

**Backend** `server/`
- Express + Node.js
- Serves images from local `media/` folder via `/media/*`
- `ImageDatabase` class scans `media/` on startup, builds JSON catalogue
- Nodemailer for contact form emails (Ethereal in dev)

---

## File Structure

```
portofolio-webbsite/
├── client/src/
│   ├── App.tsx                        # Router + conditional Lenis mount
│   ├── pages/
│   │   ├── Home.tsx                   # Assembles home section components
│   │   ├── About.tsx                  # Full about page (flip card + sections)
│   │   ├── Gallery.tsx
│   │   ├── Contact.tsx
│   │   └── Admin.tsx                  # Image database admin UI
│   ├── components/
│   │   ├── Navbar.tsx                 # Sticky nav, mobile hamburger menu
│   │   ├── Footer.tsx
│   │   ├── StatsSection.tsx           # 500+ clients / 5k+ photos / 100% stats bar
│   │   ├── ScrollOnRouteChange.tsx    # Scroll to top on route change
│   │   ├── home/
│   │   │   ├── HomeHero.tsx           # Auto-playing full-screen slideshow
│   │   │   ├── HomeIntro.tsx          # Scroll-driven 3-panel story section (300vh)
│   │   │   ├── HomeGalleryStrip.tsx   # Infinite marquee gallery (2 rows)
│   │   │   ├── HomeParallax.tsx       # Fixed-bg bridal photo + quote + stats
│   │   │   └── HomeServices.tsx       # Stacked card deck (4 panels, wheel-driven)
│   │   └── media/
│   │       └── OptimizedImage.tsx     # Img with ?w=&q=&f=webp server-side transform
│   ├── utils/
│   │   ├── media.ts                   # API_HOST, API_BASE, loadMediaOrFallback()
│   │   └── imageOptimizer.ts
│   ├── data/
│   │   └── fallbackMedia.ts           # Static fallback images if API fails
│   └── config/
│       └── animation.ts               # SLIDE_DURATION_MS, EASE_CURVE constants
│
├── server/src/
│   ├── index.js                       # Express entry, mounts routes, serves /media
│   ├── database/
│   │   └── imageDatabase.js           # Scans media/, builds category catalogue
│   ├── routes/api/
│   │   ├── index.js                   # /api router
│   │   ├── media.js                   # GET /api/database/category/:cat/:sub
│   │   └── contact.js                 # POST /api/contact (email)
│   ├── middleware/
│   │   └── imageOptimizer.js          # ?w=&q=&f= query → sharp transform
│   └── services/
│       ├── email.service.js           # Nodemailer wrapper
│       └── mediaService.js
│
├── media/                             # LOCAL ONLY — gitignored, never committed
│   ├── heroes/home/                   # Hero slideshow images
│   ├── gallery/portraits/             # Portrait gallery
│   ├── gallery/weddings/
│   ├── about/approach/                # About page portrait of photographer
│   └── contact/backgrounds/
│
├── server/data/
│   └── images.json                    # Auto-generated catalogue (filenames only, no photos)
│
└── CLAUDE.md                          # This file
```

---

## Site Architecture — Page by Page

### Home (`/`)

Lenis is **not** mounted on Home. Home has its own `wheel` event hijacking for the
stacked panels and Lenis's `preventDefault` would conflict even when stopped.

Sections in order:

1. **HomeHero** — Full-screen auto-advancing slideshow (5 s per slide, crossfade).
   `loadMediaOrFallback('hero')` fetches from `heroes/home`.

2. **HomeIntro** — 300 vh scroll-driven scene. Three panels (My Story / Unseen Moments /
   Let's Create Together). Two stacked images per panel. Native scroll drives a
   `useSpring`-smoothed progress value; no wheel hijacking.

3. **HomeGalleryStrip** — Two rows of images in infinite CSS marquee (rows go opposite
   directions). No JS scroll interaction.

4. **HomeParallax** — 80 vh section. Bridal portrait from `gallery/portraits` fetched from
   API. `background-attachment: fixed` gives the "window scrolling past the image" feel.
   Dark overlay + quote + 200+/8yrs/India stats.

5. **HomeServices** — Stacked card deck, 425 vh tall (4 panels + 0.25 vh outro buffer).
   Desktop: one `wheel` gesture = one panel advance (650 ms cooldown, `ease-out-expo`).
   Mobile/touch: `useScroll` on the section drives `progress` directly (each panel ~100 vh).
   Background `#0e1110`. `contain: paint style` + `willChange: transform` for performance.

   Cards:
   - 0 Services (dark charcoal) — Photography/Film/Video offerings grid
   - 1 Approach (near-black) — Editorial style image + philosophy text
   - 2 Notes (cream `#e4ded2`) — Client testimonials with portrait background images
   - 3 Bookings (near-black) — Contact CTA

StatsSection + Footer render below HomeServices (excluded on `/about`).

---

### About (`/about`)

Lenis IS active here (mounted in `InnerWrapper` for all non-home routes).

Sections:

1. **Hero + Portrait** — 160 vh sticky section.
   - Left: "Visual / Storyteller." heading + bio paragraph + available badge
   - Right: Portrait card with **3D flip animation**
     - Front: B&W portrait
     - Back: Full-colour portrait with name overlay
   - Desktop: `lenis.stop()` → wheel events drive `rawProgress` (0→1) →
     `useSpring` smoothed `rotateY` (0→180°) + `scale` (82%→100%).
     Releases when spring settles at ≥176°, calls `lenis.start()`.
   - Mobile: auto-plays flip after 800 ms on mount. No scroll lock.
   - Card sizes: `13rem×17rem` (mobile) → `19rem×25rem` (sm) → `24rem×31rem` (md) → `27rem×35rem` (lg)

2. **Services** — 2-column grid (Photography/Film, Approach, Pricing overview).

3. **Testimonials** — 4 hover-flip cards (CSS 3D, not scroll-driven).

4. **Thoughts** — 3 editorial cards + CTA.

StatsSection and Footer are hidden on `/about`.

---

## Key Architectural Decisions

### Lenis conditional mount (`App.tsx`)
```
/ (Home)          → no Lenis (wheel hijacking owns the input)
all other routes  → ReactLenis root, lerp: 0.18, smoothWheel: true
```

### Image serving pipeline
```
browser request → OptimizedImage (adds ?w=&q=&f=webp to URL)
               → Express imageOptimizer middleware (sharp transforms)
               → serves from media/ directory
```
API shape: `GET /api/database/category/:category/:subcategory`
Returns: `{ success: true, data: { category, images: [{ filename, url, path, size }] } }`
`url` is always a root-relative path: `/media/gallery/portraits/foo.jpg`
Frontend prepends `API_HOST` to build the full URL.

### HomeServices scroll-lock exit
When the last panel is active and the user scrolls forward (or first panel + backward):
1. `syncY = section.offsetTop + currentPanel * innerHeight` — sync actual scroll to virtual panel position
2. `exitY = section.offsetTop + section.offsetHeight - innerHeight + 10` — just past the sticky zone
3. Two `requestAnimationFrame` calls ensure Chrome compositor re-syncs before `scrollTo({ behavior: 'smooth' })`

### About flip spring
```ts
const FLIP_SPRING = { stiffness: 100, damping: 26, mass: 0.5 }
```
`rawProgress` (0→1) is a `useMotionValue` driven by wheel deltaY / 420.
`rawRotateY = useTransform(rawProgress, [0, 0.7], [0, 180])`
`rotateY = useSpring(rawRotateY, FLIP_SPRING)`

---

## Design Tokens (Tailwind)

```
primary   #0a0a0a   Deep black — main backgrounds
secondary #1a1a1a   Charcoal — card/section backgrounds
accent    #8b7355   Dark bronze — buttons, highlights
light     #f5f5f5   Off-white — main body text
muted     #888888   Medium gray — secondary text
border    #333333   Dark gray — dividers

accent CSS var: #c9a96e (used directly in some components — warm gold)
```

Fonts: `Cormorant Garamond` (serif/display), `Helvetica Neue` (sans/body)

---

## Media folders → site sections

Every section reads its images **live** from a media folder. The server rescans the
folders on each request, so adding/removing a file shows up on the next page reload —
no restart. Folder-driven sections show images **sorted by filename**, so prefix names
(`01-`, `02-`…) to control which ones show and in what order. An empty folder degrades
gracefully (dark frame / no image), never a broken image.

| Folder | Feeds | Reads |
|--------|-------|-------|
| `heroes/home/` | HomeHero slideshow | first 5 (Unsplash fallback) |
| `home/about_teaser/` | HomeIntro "Scroll Scene" | first 6 (2 per story panel) |
| `home/portfolio_slideshow/portraits/` | HomeGalleryStrip marquee | first 20 (capped for perf) |
| `home/parallax/` | HomeParallax background | first 1 |
| `home/approach/` | HomeServices · Approach panel | first 1 |
| `home/notes/` | HomeServices · Notes card backgrounds | first 2 |
| `home/bookings/` | HomeServices · Bookings panel | first 1 |
| `about/portrait/` | About flip-card portrait | first 1 |
| `about/testimonials/` | About testimonial cards | first 4 |
| `gallery/portraits/` | Gallery page (`/gallery`) main grid | up to 500 (Unsplash fallback) |
| `gallery/wides/` | Gallery page wide row | up to 500 (Unsplash fallback) |
| `heroes/gallery/` | Gallery page hero | first 1 |
| `contact/backgrounds/` | Contact page background | first 1 |

Two loaders in `client/src/utils/media.ts`:
- `loadMediaOrFallback(category)` — retries, then falls back to Unsplash placeholders.
  Used by HomeHero + the Gallery page (categories listed in `categoryEndpoint`).
- `loadFolderImages(folderPath)` — retries, returns **empty** on failure or empty
  folder (no Unsplash). Used by every folder-driven panel above.

**Not read by the site** (leftovers — safe to ignore or delete): `home/intro/`,
`home/scroll-scene/`, `about/approach/`, `home/portfolio_slideshow/landscapes/`.

`media/` is gitignored — photos never enter version control.
`server/data/images.json` is committed (filenames only, regenerated on every scan).

---

## Rate limiting

Two separate per-IP limiters (`server/src/index.js`, tuned in `server/src/config.js`):

- **API** (`/api/*`) — `RATE_LIMIT_MAX`, default **100**/15 min in prod (1000 in dev).
  Guards the contact form and data endpoints (abuse-sensitive).
- **Media** (`/media/*`) — `RATE_LIMIT_MEDIA_MAX`, default **1500**/15 min in prod
  (20000 in dev). Photos need their own generous bucket: one page pulls ~30 images, so
  a single shared limiter would 429 normal browsing and make images fail to load.

Raise `RATE_LIMIT_MEDIA_MAX` if pages get heavier (more images) or you expect high
traffic. The two limiters must stay split — never put `/media` under the API limiter.

---

## Running Locally

```bash
npm run dev              # starts both client (3000) and server (5000)
npm run dev:client       # client only
npm run dev:server       # server only
```

Server `.env` needs: `PORT=5000`, `CLIENT_URL=http://localhost:3000`

---

## Deployment Notes

- Frontend → Vercel (static), set `VITE_API_URL` env var to backend URL
- Backend → needs persistent server (Railway / Render) OR refactor to serverless
- `media/` folder → needs cloud storage (Cloudinary recommended) for production;
  update `API_HOST` in frontend to point at CDN
- `server/data/images.json` is auto-rebuilt on server startup from whatever is in `media/`
