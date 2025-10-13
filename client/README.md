# Photographer Portfolio (Client)

A modern, documentary-style photographer portfolio built with React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, and React Router.

## Features
- Full-screen hero slideshow (`src/components/HeroSlider.tsx`)
  - Image slides (fade transition)
  - Middle slide plays a video (muted, loop, playsInline)
  - Final slide has a subtle parallax effect
  - Dots navigation and autoplay
- Pages: Home, Gallery, About, Contact
- Lucide icons, responsive layout, polished typography
- Copper accent color and rich dark background theme

## Tech Stack
- React 18 + TypeScript (Vite)
- Tailwind CSS
- Framer Motion
- React Router DOM
- Lucide React

## Getting Started

### Prerequisites
- Node.js v22+ (18+ is fine)

### Install & Run
```bash
# from this folder
npm install
npm run dev
# open http://localhost:3000
```

If you edit `tailwind.config.js`, restart the dev server to pick up changes.

## File Structure (Client)
```
src/
  components/
    HeroSlider.tsx        # full-screen slideshow
    Navbar.tsx
    Footer.tsx
    Loading.tsx
  pages/
    Home.tsx              # uses <HeroSlider />
    Gallery.tsx
    About.tsx
    Contact.tsx
  App.tsx                 # simplified routes (no Suspense/AnimatePresence yet)
  main.tsx                # StrictMode temporarily disabled
  index.css               # global theme (dark bg, light text)
index.html                # meta/initialization
```

## Theming
- Tailwind tokens in `tailwind.config.js`:
  - `accent: #b87333` (copper)
  - `rich: #2b241d` (documentary dark background)
- Global body styles in `src/index.css`:
  - `@apply text-gray-100 bg-rich;`

Change the accent color by editing `extend.colors.accent` in `tailwind.config.js`. Restart dev server.

## Hero Slider Customization
Open `src/components/HeroSlider.tsx` and edit the `slides` array:
```ts
const slides = [
  { type: 'image', src: 'https://example.com/your-image-1.jpg', alt: 'Hero 1' },
  { type: 'video', src: 'https://example.com/your-video.mp4', poster: 'https://example.com/poster.jpg' },
  { type: 'parallax', src: 'https://example.com/your-image-2.jpg', alt: 'Hero 2' },
];
```
- Keep the order image → video → parallax if you like the current behavior.
- Adjust slide timing by changing `SLIDE_DURATION` (ms) at the top of `HeroSlider.tsx`.
- Tune overlay darkness by modifying the gradient in the overlay div.

## Environment Variables
- `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```
If you add a backend later, point this to your deployed API.

## Troubleshooting
- White screen in dev usually means Vite error overlay. Open DevTools Console (F12) and fix top error.
- Tailwind changes not showing? Restart `npm run dev`.
- Video not autoplaying? Keep it muted/looped, provide MP4, and use a performant CDN.

## Suggested Next Steps
- Re-enable React StrictMode in `src/main.tsx` once stable.
- Reintroduce `Suspense` + `AnimatePresence` in `App.tsx` for page transitions with `Loading` fallback.
- Add an ErrorBoundary to avoid production white screens.
- Replace mock gallery images with your sources and categories.
- Wire contact page to backend or EmailJS.

## Handoff / Context (Short)
- Dark, copper-accent theme; hero is a slideshow with video and parallax.
- Home renders `<HeroSlider />` at the top.
- Accent/color tokens live in `tailwind.config.js`. Global theme in `src/index.css`.
- Minimal routing in `App.tsx`. StrictMode off temporarily in `main.tsx`.

## Keeping README Updated
Ask the assistant to “update README” and list your changes (e.g., new pages, deployment steps, media notes). This README is intentionally concise and will be kept in sync on request.
