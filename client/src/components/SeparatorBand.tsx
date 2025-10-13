import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const SeparatorBand: React.FC = () => {
  return (
    <section className="relative w-full bg-slate-900">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-10 md:py-14">
        <div className="text-center">
          <div className="text-[10px] tracking-[0.35em] text-accent/70 uppercase mb-2">The Ethos</div>
          <h3 className="text-xl md:text-2xl font-serif text-white/90 font-normal mb-2">A little less staged. A little more you.</h3>
          <motion.div whileHover={{ x: 3 }} className="inline-flex">
            <Link
              to="/about"
              className="text-accent/70 hover:text-accent inline-flex items-center gap-2 transition-colors text-sm"
            >
              See our way
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SeparatorBand;
