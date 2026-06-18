import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import OptimizedImage from '../components/media/OptimizedImage';
import { loadMediaOrFallback, MediaItem } from '../utils/media';

type GalleryImage = {
  id: number;
  src: string;
  title: string;
  collection: string;
  aspect: number; // width / height — drives height-aware masonry placement
};

function titleFromMedia(item: MediaItem): string {
  return (item.filename || item.alt || 'Wedding photograph')
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]/g, ' ');
}

// Proportionally interleave two lists so the shorter one (wides) is spread evenly
// through the longer one (portraits) instead of clumping — that mix of tall/short
// is what gives the masonry its heterogeneous, non-rowed look.
function interleave<T>(a: T[], b: T[]): T[] {
  const out: T[] = [];
  let ai = 0;
  let bi = 0;
  while (ai < a.length || bi < b.length) {
    const aAhead = a.length ? ai / a.length : 1;
    const bAhead = b.length ? bi / b.length : 1;
    if (ai < a.length && (bi >= b.length || aAhead <= bAhead)) out.push(a[ai++]);
    else out.push(b[bi++]);
  }
  return out;
}

const Gallery = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms - content moves while background stays fixed
  const yContent = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12); // Reveal the first 12, then infinite-scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Unsplash-style masonry column count, responsive to viewport width.
  const [numColumns, setNumColumns] = useState(() => {
    if (typeof window === 'undefined') return 3;
    const w = window.innerWidth;
    return w < 640 ? 1 : w < 1024 ? 2 : 3;
  });

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      // Pull the whole set (metadata only) so infinite scroll can reach every photo.
      loadMediaOrFallback('gallery', { limit: 500, signal: controller.signal }),
      loadMediaOrFallback('galleryWides', { limit: 500, signal: controller.signal }),
      loadMediaOrFallback('galleryHero', { limit: 1, signal: controller.signal }),
    ]).then(([portraits, wides, hero]) => {
      let id = 1;
      const portraitItems = portraits.map((item) => ({
        id: id++,
        src: item.url,
        title: titleFromMedia(item),
        collection: 'Portraits',
        aspect: 0.67, // tall (2:3-ish)
      }));
      const wideItems = wides.map((item) => ({
        id: id++,
        src: item.url,
        title: titleFromMedia(item),
        collection: 'Wides',
        aspect: 1.5, // short (3:2)
      }));

      // Spread the short wides through the tall portraits for a mixed, organic grid.
      setImages(interleave(portraitItems, wideItems));
      setHeroUrl(hero[0]?.url || portraits[0]?.url || wides[0]?.url || null);
    });

    return () => controller.abort();
  }, []);

  // Infinite scroll: reveal more images as a sentinel near the bottom enters view,
  // until every fetched photo is shown — no "load more" button.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayCount((prev) => Math.min(prev + 8, images.length));
        }
      },
      { rootMargin: '800px 0px' } // start loading well before the user hits the end
    );
    io.observe(el);
    return () => io.disconnect();
  }, [images.length]);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      setNumColumns(w < 640 ? 1 : w < 1024 ? 2 : 3);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Height-aware masonry: place each image into the currently-shortest column
  // (estimating height from its aspect ratio). This packs tall portraits and short
  // wides into a staggered, heterogeneous layout — and because placement is
  // sequential, a longer slice reuses the exact same column assignments for the
  // earlier items, so infinite scroll never reshuffles what's already on screen.
  const visible = images.slice(0, displayCount);
  const columns = Array.from({ length: numColumns }, () => [] as GalleryImage[]);
  const colHeights = new Array(numColumns).fill(0);
  for (const image of visible) {
    let shortest = 0;
    for (let c = 1; c < numColumns; c++) {
      if (colHeights[c] < colHeights[shortest]) shortest = c;
    }
    columns[shortest].push(image);
    colHeights[shortest] += 1 / image.aspect; // portrait (small aspect) adds more height
  }

  return (
    <div className="bg-rich">
      {/* Parallax Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Fixed Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed mono"
          style={{
            backgroundImage: heroUrl ? `url('${heroUrl}')` : undefined
          }}
        />
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Moving Content with Enhanced Typography */}
        <motion.div 
          className="relative z-10 h-full flex items-center justify-center text-center px-4"
          style={{ y: yContent, opacity: opacityContent }}
        >
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div 
                className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-6 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Gallery
              </motion.div>
              <motion.h1 
                className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-white mb-6 sm:mb-8 leading-tight sm:leading-[0.9] tracking-tight px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Featured<br />
                <span className="text-slate-400 font-light italic">Collection</span>
              </motion.h1>
              <motion.p 
                className="text-slate-300 text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
              >
                A curated selection of moments that define our approach to documentary photography
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Gallery Grid Section with Enhanced Aesthetics */}
      <section className="relative py-20 md:py-32">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-12">
          {/* Refined Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20"
          >
            <motion.div 
              className="text-xs tracking-[0.4em] uppercase text-accent/90 mb-4 font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Portfolio
            </motion.div>
            <motion.h2 
              className="font-serif text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Recent Work
            </motion.h2>
            <motion.p 
              className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed font-light"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              Each image tells a story of authentic moments captured with intention and care
            </motion.p>
          </motion.div>

          {/* Unsplash-style masonry: equal-width columns, natural aspect ratios,
              square corners, flat (no shadow), even gutters. */}
          <div className="flex gap-4 sm:gap-6">
            {columns.map((col, ci) => (
              <div key={ci} className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
                {col.map((image) => (
                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    whileHover={{ y: -4 }}
                    className="group relative overflow-hidden bg-white/5"
                  >
                    <OptimizedImage
                      src={image.src}
                      alt={image.title}
                      width={1200}
                      quality={76}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                    />

                    {/* Clean hover highlight — brighter ring + the image's zoom/lift; no text. */}
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-white/5 transition duration-500 group-hover:ring-2 group-hover:ring-white/30" />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>

          {/* Infinite-scroll trigger: reveals more images as it nears the viewport. */}
          {displayCount < images.length && <div ref={sentinelRef} aria-hidden className="h-4 w-full" />}

          {/* Enhanced Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mt-24"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-slate-400 text-lg md:text-xl mb-8 font-light leading-relaxed">
                Interested in working together?
              </p>
              <motion.a 
                href="/contact" 
                className="group inline-flex items-center px-12 py-4 text-sm font-medium text-white bg-transparent border border-accent/40 hover:border-accent/80 hover:bg-accent/5 transition-all duration-500 uppercase tracking-[0.2em] rounded-sm"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="group-hover:tracking-[0.3em] transition-all duration-300">
                  Get in Touch
                </span>
                <motion.div
                  className="ml-3 w-0 group-hover:w-4 transition-all duration-300 overflow-hidden"
                  initial={{ x: -10, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                >
                  →
                </motion.div>
              </motion.a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
