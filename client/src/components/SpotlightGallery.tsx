import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// A full-viewport, scroll-driven gallery:
// - Sticky spotlight viewport with dark, hazy background
// - Each section step advances to next "page"
// - Page can be a triptych (3 portrait images) or a single hero (landscape)

type Page =
  | { type: 'triptych'; images: { id: string; src: string; alt: string }[] }
  | { type: 'hero'; image: { id: string; src: string; alt: string } };

const SpotlightGallery: React.FC = () => {
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

  // Discrete paging: wheel/touch/keys. Pass-through at edges
  const sectionRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let touchStartY = 0;
    let locked = false;
    const cooldown = 320; // ms between page steps
    const lock = () => {
      locked = true;
      setTimeout(() => (locked = false), cooldown);
    };

    const goNext = () => setPageIndex((i) => Math.min(i + 1, pages.length - 1));
    const goPrev = () => setPageIndex((i) => Math.max(i - 1, 0));

    const onWheel = (e: WheelEvent) => {
      const atStart = pageIndex === 0;
      const atEnd = pageIndex === pages.length - 1;
      if ((atStart && e.deltaY < 0) || (atEnd && e.deltaY > 0)) {
        // Let the page scroll normally beyond the gallery
        return;
      }
      e.preventDefault();
      if (locked) return;
      if (e.deltaY > 0) goNext(); else goPrev();
      lock();
    };

    const onKey = (e: KeyboardEvent) => {
      if (locked) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown') { goNext(); lock(); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { goPrev(); lock(); }
    };

    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const delta = e.changedTouches[0].clientY - touchStartY;
      const atStart = pageIndex === 0;
      const atEnd = pageIndex === pages.length - 1;
      if ((atStart && delta > 0) || (atEnd && delta < 0)) {
        return; // allow page to scroll
      }
      if (Math.abs(delta) < 25) return;
      if (locked) return;
      if (delta < 0) goNext(); else goPrev();
      lock();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      el.removeEventListener('wheel', onWheel as any);
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchend', onTouchEnd as any);
      window.removeEventListener('keydown', onKey);
    };
  }, [pageIndex, pages.length]);

  const current = pages[pageIndex];

  return (
    <section className="relative w-full h-screen">
      {/* dark, hazy background that feels like its own section */}
      <div className="absolute inset-0 bg-gray-900/90" />
      {/* subtle neutral vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(70%_70%_at_50%_20%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* sticky viewport with discrete paging */}
      <div ref={viewportRef} className="sticky top-0 h-screen flex items-center overflow-hidden">
        <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-8">
          <div className="text-center mb-6">
            <div className="text-[11px] tracking-[0.25em] uppercase text-accent/70 mb-2">Portfolio</div>
            <h2 className="font-serif text-3xl md:text-5xl font-normal text-white/90">In focus</h2>
          </div>

          {/* Animated slide stage */}
          <AnimatePresence mode="wait">
            <motion.div
              key={pageIndex}
              initial={{ opacity: 0.9, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0.9, y: -22 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[76vh]"
            >
              {current.type === 'triptych' ? (
                <div className="grid grid-cols-3 gap-6 h-full">
                  {current.images.map((img, i) => (
                    <div
                      key={img.id}
                      className={`relative h-full rounded-lg overflow-hidden bg-black/25 shadow-2xl shadow-black/60 ring-1 ${i === 1 ? 'ring-accent/30' : 'ring-white/10'} `}
                   >
                      <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                      {/* spotlight effect */}
                      <div className={`absolute inset-0 transition-opacity duration-500 ${i === 1 ? 'opacity-0' : 'opacity-50 bg-black'}`} />
                      <div className={`absolute inset-0 transition duration-500 ${i === 1 ? '' : 'backdrop-blur-[1px]'}`} />
                      {/* subtle inner border to mimic a frame */}
                      <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 rounded-lg" />
                    </div>
                  ))}
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
                  <button
                    key={i}
                    onClick={() => setPageIndex(i)}
                    className={`h-2 w-2 rounded-full ${pageIndex === i ? 'bg-accent' : 'bg-slate-700 hover:bg-slate-600'}`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default SpotlightGallery;
