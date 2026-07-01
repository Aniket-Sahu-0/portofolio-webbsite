import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
    <section className="relative h-[100svh] min-h-[100svh] overflow-hidden bg-primary pt-24">
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
        {/* Lighter scrims so the photo reads as the focus; a soft radial keeps the centered text legible */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(75%_55%_at_50%_60%,rgba(0,0,0,0.55),transparent_74%)]" />
      </div>

      <div className="container relative z-10 flex min-h-[calc(100svh-6rem)] flex-col items-center justify-center text-center">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_CURVE }}
          className="max-w-2xl"
        >
          <p className="mb-5 text-[0.7rem] uppercase tracking-[0.4em] text-light/70 sm:text-xs">
            Wedding Photography &amp; Film
          </p>
          <h1 className="text-[2rem] font-light leading-[1.12] tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Cinematic stories of the day that matters
          </h1>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-light/75 sm:text-base">
            Documentary-led coverage with a quiet, editorial eye.
          </p>
          <Link
            to="/gallery"
            className="mt-9 inline-flex items-center border border-accent bg-accent/10 px-8 py-3.5 text-[0.7rem] uppercase tracking-[0.28em] text-accent transition-colors duration-300 hover:bg-accent hover:text-white"
          >
            Browse Portfolio
          </Link>
        </motion.div>
      </div>
      {/* Scroll cue — signals there's more below the fold */}
      <div className="pointer-events-none absolute inset-x-0 bottom-10 z-10 flex flex-col items-center gap-2 text-light/50">
        <span className="text-[0.6rem] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-7 w-px bg-light/30" />
      </div>
    </section>
  );
};

export default HomeHero;
