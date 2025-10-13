import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-45%', '45%']);

  return (
    <section ref={ref} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <motion.div 
        className="absolute inset-0 w-full h-[190%] bg-cover bg-center -top-[45%]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1470219556762-1771e7f9427d?q=80&w=2148&auto=format&fit=crop')",
          y
        }}
      />
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
            Raw, Honest, Unfussy
          </h2>
          <a 
            href="/portfolio" 
            className="px-8 py-3 bg-transparent border-2 border-white text-white text-sm font-semibold rounded-none hover:bg-white hover:text-black transition-colors duration-300 inline-flex items-center justify-center uppercase tracking-widest"
          >
            Our Way
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default ParallaxSection;
