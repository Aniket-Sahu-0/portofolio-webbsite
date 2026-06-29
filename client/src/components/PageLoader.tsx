import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Full-screen branded loader shown on first paint and removed once the hero
 * image is ready (or a safety timeout fires). Prevents the "content first,
 * images pop in later" flash on landing.
 */
const PageLoader: React.FC<{ visible: boolean }> = ({ visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        key="page-loader"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-primary"
      >
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="font-display text-lg tracking-[0.42em] text-white sm:text-2xl"
        >
          THE WEDDING SHADE
        </motion.span>
        <div className="mt-6 h-px w-40 overflow-hidden bg-white/15">
          <motion.div
            className="h-full w-1/3 bg-accent"
            animate={{ x: ['-120%', '360%'] }}
            transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default PageLoader;
