import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type Page =
  | { type: 'triptych'; images: { id: string; src: string; alt: string }[] }
  | { type: 'hero'; image: { id: string; src: string; alt: string } };

const PortfolioShowcase: React.FC = () => {
  // Define pages mixing vertical triptychs and single horizontal heroes
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

  const flatImages = pages.flatMap((p) => (p.type === 'triptych' ? p.images : [p.image]));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // Autoplay timer for the slider
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage((prev) => (prev + 1) % pages.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearTimeout(timer);
  }, [currentPage, pages.length]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i === null ? null : (i + 1) % flatImages.length));
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i === null ? null : (i - 1 + flatImages.length) % flatImages.length));
    },
    [activeIndex, flatImages.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKey]);

  return (
    <section className="relative bg-slate-950">
      {/* Blurry dark background hue */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_20%,rgba(184,115,51,0.08),transparent_60%)]" />
      <div className="absolute inset-0 backdrop-blur-sm" />

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-10">
          <div className="text-[11px] tracking-[0.25em] uppercase text-accent/70 mb-2">Portfolio</div>
          <h2 className="font-serif text-3xl md:text-5xl font-normal text-white/90">From the portfolio</h2>
        </div>

        {/* Animated Slider */}
        <div className="relative h-[85vh] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0.8, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.8, x: -30 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {(() => {
                const page = pages[currentPage];
                if (page.type === 'triptych') {
                  return (
                    <div className="grid grid-cols-3 gap-4 h-full">
                      {page.images.map((img) => (
                        <button
                          key={img.id}
                          onClick={() => setActiveIndex(flatImages.findIndex((f) => f.id === img.id))}
                          className="relative overflow-hidden h-full"
                        >
                          <img src={img.src} alt={img.alt} className="w-full h-full object-cover aspect-[3/4]" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  );
                } else {
                  return (
                    <button
                      onClick={() => setActiveIndex(flatImages.findIndex((f) => f.id === page.image.id))}
                      className="relative overflow-hidden w-full h-full"
                    >
                      <img src={page.image.src} alt={page.image.alt} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/10" />
                    </button>
                  );
                }
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center gap-3 pt-6">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`h-2 w-2 rounded-full transition-colors ${currentPage === index ? 'bg-accent' : 'bg-slate-700 hover:bg-slate-600'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeIndex !== null && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIndex(null)}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4" onClick={(e) => e.stopPropagation()}>
              <motion.img
                key={flatImages[activeIndex].id}
                src={flatImages[activeIndex].src}
                alt={flatImages[activeIndex].alt}
                className="max-h-[85vh] max-w-[90vw] object-contain rounded"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
              <button
                aria-label="Close"
                className="absolute top-4 right-4 text-white/90 hover:text-white"
                onClick={() => setActiveIndex(null)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PortfolioShowcase;
