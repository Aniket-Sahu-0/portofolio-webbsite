import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

type GalleryImage = {
  id: number;
  src: string;
  title: string;
  size: 'small' | 'medium' | 'large' | 'wide';
  collection: string;
};
type MediaItem = { filename: string; url: string };

const Gallery = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Parallax transforms - content moves while background stays fixed
  const yContent = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Dynamic media from backend
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [heroUrl, setHeroUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        // Fetch portraits and wides
        const [portraitsRes, widesRes, heroRes] = await Promise.all([
          fetch(`${API_BASE}/api/media/list?path=gallery/portraits`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/media/list?path=gallery/wides`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/media/list?path=heroes/gallery`, { signal: controller.signal }),
        ]);
        const portraitsJson = await portraitsRes.json().catch(() => ({ items: [] }));
        const widesJson = await widesRes.json().catch(() => ({ items: [] }));
        const heroJson = await heroRes.json().catch(() => ({ items: [] }));

        // Build gallery items
        let id = 1;
        const portraitSizes: Array<GalleryImage['size']> = ['small', 'medium', 'large'];
        const portraits: GalleryImage[] = (portraitsJson.items || []).map((it: MediaItem, idx: number) => ({
          id: id++,
          src: it.url,
          title: it.filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          size: portraitSizes[idx % portraitSizes.length],
          collection: 'Portraits',
        }));
        const wides: GalleryImage[] = (widesJson.items || []).map((it: MediaItem) => ({
          id: id++,
          src: it.url,
          title: it.filename.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' '),
          size: 'wide',
          collection: 'Wides',
        }));
        const merged = [...portraits, ...wides];
        // If nothing found, leave empty to allow fallback below
        if (merged.length > 0) setImages(merged);

        const heroItem: MediaItem | undefined = (heroJson.items || [])[0];
        if (heroItem) setHeroUrl(heroItem.url);
      } catch (_) {
        // ignore, use static fallback
      }
    }
    load();
    return () => controller.abort();
  }, []);

  // Helper to get sophisticated grid size classes with golden ratio proportions
  const getSizeClasses = (size: GalleryImage['size']) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1 aspect-square';
      case 'medium':
        return 'col-span-1 row-span-2 aspect-[5/8]'; // Golden ratio inspired
      case 'large':
        return 'col-span-1 row-span-3 aspect-[3/5]'; // Taller, more elegant
      case 'wide':
        return 'col-span-2 row-span-1 aspect-[8/5]'; // Golden ratio landscape
      default:
        return 'col-span-1 row-span-1 aspect-square';
    }
  };

  return (
    <div className="bg-rich">
      {/* Parallax Hero Section */}
      <section ref={heroRef} className="relative h-screen overflow-hidden">
        {/* Fixed Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed mono"
          style={{
            backgroundImage: `url('${heroUrl ?? "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?q=80&w=2000&auto=format&fit=crop"}')`
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
                className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-[0.9] tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.7 }}
              >
                Featured<br />
                <span className="text-slate-400 font-light italic">Collection</span>
              </motion.h1>
              <motion.p 
                className="text-slate-300 text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed font-light"
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

          {/* Enhanced Masonry Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-min">
            {(images.length ? images : [] ).map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: (index % 4) * 0.15,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ y: -8 }}
                className={`relative group overflow-hidden bg-black/10 rounded-sm shadow-2xl shadow-black/40 ${getSizeClasses(image.size)}`}
              >
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover mono transition-all duration-700 group-hover:scale-110 group-hover:contrast-110"
                  loading="lazy"
                />
                
                {/* Subtle Border */}
                <div className="absolute inset-0 ring-1 ring-white/5 rounded-sm" />
                
                {/* Enhanced Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <motion.h3 
                      className="text-white font-medium text-base md:text-lg mb-2 tracking-wide"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {image.title}
                    </motion.h3>
                    <motion.p 
                      className="text-slate-300 text-sm md:text-base font-light tracking-wide"
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {image.collection}
                    </motion.p>
                  </div>
                </div>

                {/* Refined Collection Tag */}
                <div className="absolute top-4 left-4 px-3 py-1.5 text-xs font-medium text-white bg-black/60 rounded-full backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
                  {image.collection}
                </div>
              </motion.div>
            ))}
          </div>

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
