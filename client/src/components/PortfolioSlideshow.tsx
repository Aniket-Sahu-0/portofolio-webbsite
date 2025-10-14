import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SLIDE_DURATION_MS, TRANSITION_DURATION_S, EASE_CURVE } from '../config/animation';

// Non-interactive slideshow version of the portfolio spotlight
// - Full viewport section (distinct, contained)
// - Auto-fades between pages every few seconds
// - Pages can be: triptych (3 portrait images) or hero (single landscape)

type Page =
  | { type: 'triptych'; images: { id: string; src: string; alt: string }[] }
  | { type: 'hero'; image: { id: string; src: string; alt: string } };

const PortfolioSlideshow: React.FC = () => {
  const pages = useMemo<Page[]>(
    () => [
      {
        type: 'triptych',
        images: [
          { id: 'v1', src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1200&auto=format&fit=crop', alt: 'Editorial portrait' },
          { id: 'v2', src: 'https://images.unsplash.com/photo-1542596594-649ed6e6b342?q=80&w=1200&auto=format&fit=crop', alt: 'Bridal portrait' },
          { id: 'v3', src: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=1200&auto=format&fit=crop', alt: 'Candid moment' },
        ],
      },
      {
        type: 'hero',
        image: { id: 'h1', src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1920&auto=format&fit=crop', alt: 'Celebration scene' },
      },
      {
        type: 'triptych',
        images: [
          { id: 'v4', src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1200&auto=format&fit=crop', alt: 'Nature portrait' },
          { id: 'v5', src: 'https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?q=80&w=1200&auto=format&fit=crop', alt: 'Quiet glance' },
          { id: 'v6', src: 'https://images.unsplash.com/photo-1520367445533-93201a35a52a?q=80&w=1200&auto=format&fit=crop', alt: 'Hand in hand' },
        ],
      },
      {
        type: 'hero',
        image: { id: 'h2', src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop', alt: 'Candid embrace' },
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const SLIDE_DURATION = SLIDE_DURATION_MS; // shared cadence

  // Dark photography theme
  const theme = useMemo(
    () => ({
      base: 'rgba(10,10,10,0.95)', // deep black with opacity
      tint: 'rgba(139,115,85,0.08)', // dark bronze with opacity  
      vignette: 'radial-gradient(80% 80% at 50% 20%, rgba(139,115,85,0.15), transparent 65%)', // bronze vignette
    }),
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % pages.length);
    }, SLIDE_DURATION); // match Hero cadence
    return () => clearInterval(id);
  }, [pages.length, SLIDE_DURATION]);

  const current = pages[index];

  // --- Image-driven tint via canvas sampling (Approach A) ---
  type DerivedTheme = { tint: string; vignette: string } | null;
  const [derived, setDerived] = useState<DerivedTheme[]>(Array(pages.length).fill(null));

  // Helper: clamp a value to [min, max]
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  // Compute a soft tint/vignette from an image URL
  const sampleTintFromImage = (src: string): Promise<DerivedTheme> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const w = 16, h = 16;
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, w, h);
          const data = ctx.getImageData(0, 0, w, h).data;
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3] / 255;
            if (a < 0.5) continue; // skip mostly-transparent
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            count++;
          }
          if (!count) return resolve(null);
          r = Math.round(r / count); g = Math.round(g / count); b = Math.round(b / count);
          // Desaturate a bit toward gray to avoid loud tints
          const avg = (r + g + b) / 3;
          const mix = 0.35; // 0..1, higher = more gray
          r = Math.round(r * (1 - mix) + avg * mix);
          g = Math.round(g * (1 - mix) + avg * mix);
          b = Math.round(b * (1 - mix) + avg * mix);
          r = clamp(r, 10, 245); g = clamp(g, 10, 245); b = clamp(b, 10, 245);
          const tint = `rgba(${r}, ${g}, ${b}, 0.18)`;
          const vignette = `radial-gradient(80% 80% at 50% 20%, rgba(${r}, ${g}, ${b}, 0.24), transparent 65%)`;
          resolve({ tint, vignette });
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  // Precompute derived tints for all pages (center image for triptych)
  useEffect(() => {
    let mounted = true;
    (async () => {
      const results: DerivedTheme[] = [];
      for (const p of pages) {
        const src = p.type === 'triptych' ? p.images[1]?.src || p.images[0].src : p.image.src;
        const sampled = await sampleTintFromImage(src);
        results.push(sampled);
      }
      if (mounted) setDerived(results);
    })();
    return () => { mounted = false; };
  }, [pages]);

  return (
    <section aria-label="Portfolio" className="relative w-full h-screen">
      {/* Animated, themed background per slide */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`bg-${index}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: TRANSITION_DURATION_S }}
        >
          <div className="absolute inset-0" style={{ background: theme.base }} />
          <div className="absolute inset-0" style={{ background: theme.tint }} />
          <div className="absolute inset-0 pointer-events-none" style={{ background: theme.vignette }} />
          {/* subtle texture overlay for a gallery-wall feel */}
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)',
              backgroundSize: '3px 3px, 4px 4px',
              backgroundPosition: '0 0, 1px 1px',
            }}
          />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      {/* Contained content area */}
      <div className="relative z-10 h-full flex items-center">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-6">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent/70 mb-2">Portfolio</div>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white/90">Highlights</h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: TRANSITION_DURATION_S, ease: EASE_CURVE }}
              className="relative h-[76vh]"
            >
              {current.type === 'triptych' ? (
                <div className="grid grid-cols-3 gap-6 h-full">
                  {current.images.map((img, i) => {
                    // Use derived tint (or curated) to color the center ring subtly
                    const dt = derived[index % derived.length] || null;
                    const fallbackTint = theme.tint;
                    const tintStr = dt?.tint || fallbackTint; // e.g., rgba(r,g,b,0.18)
                    const ringColor = tintStr.replace(/rgba\(([^)]+),\s*([0-9.]+)\)/, 'rgba($1, 0.35)');
                    return (
                      <div
                        key={img.id}
                        className={`relative h-full rounded-lg overflow-hidden bg-black/25 shadow-2xl shadow-black/60 ring-1 ${i === 1 ? '' : 'ring-white/10'}`}
                        style={i === 1 ? { boxShadow: `inset 0 0 0 1px ${ringColor}, 0 10px 30px -10px rgba(0,0,0,0.7)` } : undefined}
                      >
                        <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                        <div className={`absolute inset-0 transition-opacity duration-500 ${i === 1 ? 'opacity-0' : 'opacity-50 bg-black'}`} />
                        <div className={`absolute inset-0 transition duration-500 ${i === 1 ? '' : 'backdrop-blur-[1px]'}`} />
                        <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 rounded-lg" />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="relative h-full rounded-lg overflow-hidden bg-black/25 shadow-2xl shadow-black/60 ring-1 ring-accent/30">
                  <img src={current.image.src} alt={current.image.alt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 rounded-lg" />
                </div>
              )}

              {/* dots */}
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                {pages.map((_, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${index === i ? 'bg-accent' : 'bg-slate-700'}`} />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSlideshow;
