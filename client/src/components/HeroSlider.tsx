import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { SLIDE_DURATION_MS, TRANSITION_DURATION_S } from '../config/animation';
import { applyPreset } from '../utils/imageOptimizer';

// Simple, themeable hero slider that supports images, a video slide, and a parallax final slide.
// Full-screen, auto-plays, and fades between slides. You can replace the media URLs below.

type Slide =
  | { type: 'image'; src: string; alt?: string }
  | { type: 'video'; src: string; poster?: string }
  | { type: 'parallax'; src: string; alt?: string };

const SLIDE_DURATION = SLIDE_DURATION_MS; // ms (shared)

const HeroSlider: React.FC = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  const abs = useCallback((u: string | undefined | null) => {
    if (!u) return '';
    return u.startsWith('/') ? `${API_HOST}${u}` : u;
  }, [API_HOST]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSlides() {
      try {
        const [imagesRes, videoRes] = await Promise.all([
          fetch(`${API_HOST}/api/media/list?path=heroes/home`, { signal: controller.signal }),
          fetch(`${API_HOST}/api/media/list?path=home/homepage_video`, { signal: controller.signal }),
        ]);

        const imagesData = await imagesRes.json().catch(() => ({ items: [] }));
        const videoData = await videoRes.json().catch(() => ({ items: [] }));

        console.log('HeroSlider: Fetched images:', imagesData.items?.length || 0);
        console.log('HeroSlider: Fetched videos:', videoData.items?.length || 0);

        const imageSlides: Slide[] = (imagesData.items || []).map((item: any) => ({
          type: 'image',
          src: abs(item.url),
          alt: item.filename,
        }));

        const videoSlide: Slide | null = videoData.items && videoData.items[0] ? {
          type: 'video',
          src: abs(videoData.items[0].url),
          poster: imageSlides.length > 0 ? imageSlides[0].src : undefined,
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

        console.log('HeroSlider: Final slides count:', finalSlides.length);
        if (finalSlides.length > 0) {
          setSlides(finalSlides);
        }
      } catch (error) {
        console.error('Failed to load slides', error);
      } finally {
        setLoading(false);
      }
    }

    loadSlides();
    return () => controller.abort();
  }, [API_HOST]);

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
    if (!current) return; // Safety check
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

  console.log('HeroSlider render: loading=', loading, 'slides.length=', slides.length);

  if (loading) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-secondary/90" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-display font-light text-5xl md:text-7xl lg:text-8xl drop-shadow-2xl tracking-widest mb-8">
            THE WEDDING SHADE
          </h1>
          <p className="font-accent text-2xl md:text-3xl italic text-accent tracking-wide">
            Photography & Storytelling
          </p>
        </div>
      </section>
    );
  }

  if (slides.length === 0) {
    return (
      <section className="relative w-full h-screen overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-secondary/90" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-white font-display font-light text-5xl md:text-7xl lg:text-8xl drop-shadow-2xl tracking-widest mb-8">
            THE WEDDING SHADE
          </h1>
          <p className="font-accent text-2xl md:text-3xl italic text-accent tracking-wide">
            Photography & Storytelling
          </p>
        </div>
      </section>
    );
  }

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

              {/* Minimalist centered copy - Mobile optimized */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
                <h1 className="text-white font-display font-light text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl drop-shadow-2xl tracking-wider sm:tracking-widest mb-2 sm:mb-4 md:mb-6 lg:mb-8 leading-tight">
                  THE WEDDING SHADE
                </h1>
                <p className="font-accent text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl italic text-accent tracking-wide">
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
