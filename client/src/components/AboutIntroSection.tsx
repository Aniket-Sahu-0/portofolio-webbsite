import React from 'react';
import { motion } from 'framer-motion';

const AboutIntroSection: React.FC = () => {
  return (
    <section className="relative w-full bg-rich py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <div className="text-xs tracking-[0.3em] uppercase text-accent/80 mb-3">About</div>
            <h2 className="font-serif text-3xl md:text-5xl leading-tight text-white mb-4">
              Documentary storyteller with a quiet approach
            </h2>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed">
              I’m a documentary photographer focused on honest, unfussy narratives. I look for small truths—the laugh that escapes, a quick touch, the breath before a promise. My goal is simple: let you be you, and make the images feel like you.
            </p>
          </motion.div>

          {/* Photos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200&auto=format&fit=crop"
                alt="Portrait documentary"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] -mt-8 md:mt-8 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=1200&auto=format&fit=crop"
                alt="Candid moment"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutIntroSection;
