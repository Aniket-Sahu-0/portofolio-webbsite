import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '../media/OptimizedImage';
import { EASE_CURVE, SLIDE_DURATION_MS, TRANSITION_DURATION_S } from '../../config/animation';
import { loadMediaOrFallback, MediaItem } from '../../utils/media';

const HomeHero: React.FC<{ onReady?: () => void }> = ({ onReady }) => {
  const [slides, setSlides] = useState<MediaItem[]>([]);
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const readyFired = useRef(false);

  const signalReady = () => {
    if (!readyFired.current) {
      readyFired.current = true;
      onReady?.();
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadMediaOrFallback('hero', { limit: 5, signal: controller.signal }).then(setSlides);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION_MS);
    return () => window.clearInterval(id);
  }, [slides.length, reduceMotion]);

  const current = slides[index];

  return (
    <section className="relative h-screen min-h-screen overflow-hidden bg-primary pt-24">
      <div className="absolute inset-0">
        {current ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || current.url}
              className="absolute inset-0"
              initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: reduceMotion ? 1 : 1.08 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: TRANSITION_DURATION_S, ease: EASE_CURVE },
                scale: { duration: SLIDE_DURATION_MS / 1000, ease: 'easeOut' },
              }}
            >
              <OptimizedImage
                src={current.url}
                alt={current.alt || 'Wedding photography hero'}
                width={1920}
                height={1080}
                quality={80}
                sizes="100vw"
                priority
                onLoad={signalReady}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="h-full w-full bg-secondary" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/45 via-primary/48 to-primary" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,10,0.78),rgba(10,10,10,0.22),rgba(10,10,10,0.66))]" />
      </div>

      <div className="container relative z-10 flex min-h-[calc(100vh-6rem)] items-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_CURVE }}
          className="max-w-3xl"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-8 bg-accent/70" />
            <p className="text-xs uppercase tracking-[0.38em] text-accent">Wedding Photography</p>
          </div>
          <h1 className="max-w-4xl text-5xl font-light leading-[0.95] tracking-wide text-white sm:text-6xl md:text-7xl lg:text-8xl">
            The Wedding Shade
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-light/75 md:text-lg">
            Quiet, editorial wedding stories — built around the moments that matter.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/gallery" className="btn btn-primary gap-3">
              View Portfolio <ArrowRight size={17} />
            </Link>
            <Link to="/contact" className="btn btn-outline">
              Enquire Now
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeHero;
