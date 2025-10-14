import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SLIDE_DURATION_MS, TRANSITION_DURATION_S } from '../config/animation';

// Simple, themeable hero slider that supports images, a video slide, and a parallax final slide.
// Full-screen, auto-plays, and fades between slides. You can replace the media URLs below.

type Slide =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'parallax'; src: string; alt?: string };

const SLIDE_DURATION = SLIDE_DURATION_MS; // ms (shared)

const HeroSlider: React.FC = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  // Start with fallback slides immediately to prevent empty state
  const [slides, setSlides] = useState<Slide[]>([
    { type: 'image', src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop', alt: 'Wedding candid' },
    { type: 'video', src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4', poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop' },
    { type: 'parallax', src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1920&auto=format&fit=crop', alt: 'Celebration with parallax' },
  ]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSlides() {
      try {
        const [imagesRes, videoRes] = await Promise.all([
          fetch(`${API_BASE}/api/media/list?path=heroes/home`, { signal: controller.signal }),
          fetch(`${API_BASE}/api/media/list?path=home/homepage_video`, { signal: controller.signal }),
        ]);

        const imagesData = await imagesRes.json().catch(() => ({ items: [] }));
        const videoData = await videoRes.json().catch(() => ({ items: [] }));

        const imageSlides: Slide[] = (imagesData.items || []).map((item: any) => ({
          type: 'image',
          src: item.url,
          alt: item.filename,
        }));

        const videoSlide: Slide | null = videoData.items && videoData.items[0] ? {
          type: 'video',
          src: videoData.items[0].url,
          poster: imageSlides.length > 0 ? imageSlides[0].src : 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop',
        } : null;

        const finalSlides = [...imageSlides];
        if (videoSlide) {
          finalSlides.splice(1, 0, videoSlide); // Insert video as the second slide
        }

        if (finalSlides.length > 1) {
            finalSlides.push({
                type: 'parallax',
                src: finalSlides[finalSlides.length - 1].src, // Use the last image for parallax
                alt: 'Parallax celebration'
            });
        }

        if (finalSlides.length > 0) {
          setSlides(finalSlides);
        } else {
          // Fallback to static slides
          setSlides([
            { type: 'image', src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop', alt: 'Wedding candid' },
            { type: 'video', src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4', poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop' },
            { type: 'parallax', src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1920&auto=format&fit=crop', alt: 'Celebration with parallax' },
          ]);
        }
      } catch (error) {
        console.error('Failed to load slides, using fallback', error);
        setSlides([
          { type: 'image', src: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1920&auto=format&fit=crop', alt: 'Wedding candid' },
          { type: 'video', src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4', poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop' },
          { type: 'parallax', src: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=1920&auto=format&fit=crop', alt: 'Celebration with parallax' },
        ]);
      }
    }

    loadSlides();
    return () => controller.abort();
  }, [API_BASE]);

  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (slides.length === 0) return; // Safety check
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    // Play/pause when switching to/from the video slide
    const current = slides[index];
    if (current.type === 'video' && videoRef.current) {
      // best-effort autoplay; browsers may block until user interaction
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [index, slides]);

  // Parallax for the last slide
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 600], [0, -80]); // subtle upward drift

  return (
    <section ref={containerRef} className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {slides.map((slide, i) =>
          i === index ? (
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: TRANSITION_DURATION_S }}
            >
              {slide.type === 'image' && (
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{ backgroundImage: `url(${slide.src})` }}
                  aria-label={slide.alt}
                  role="img"
                />
              )}

              {slide.type === 'video' && (
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  src={slide.src}
                  poster={slide.poster}
                  muted
                  loop
                  playsInline
                />
              )}

              {slide.type === 'parallax' && (
                <motion.div
                  className="absolute inset-0 bg-center bg-cover"
                  aria-label={slide.alt}
                  role="img"
                  style={{ y: yParallax, backgroundImage: `url(${slide.src})` }}
                />
              )}

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-secondary/90" />

              {/* Minimalist centered copy */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-white font-display font-light text-5xl md:text-7xl lg:text-8xl drop-shadow-2xl tracking-widest mb-8">
                  THE WEDDING SHADE
                </h1>
                <p className="font-accent text-2xl md:text-3xl italic text-accent tracking-wide">
                  Photography & Storytelling
                </p>
              </div>
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      {/* Minimal bottom progress dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-6 bg-accent' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />)
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
