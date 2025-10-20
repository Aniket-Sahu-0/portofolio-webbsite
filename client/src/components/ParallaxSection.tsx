import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const ParallaxSection = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_HOST}/api/database/category/home/parallax`, { signal: controller.signal });
        const json = await res.json().catch(() => ({ data: { images: [] } }));
        if (json.data?.images && json.data.images[0]) {
          setBgImage(json.data.images[0].url.startsWith('/') ? `${API_HOST}${json.data.images[0].url}` : json.data.images[0].url);
        }
      } catch (_) {}
    })();
    return () => controller.abort();
  }, [API_HOST]);
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
          backgroundImage: bgImage ? `url('${bgImage}')` : undefined,
          backgroundColor: bgImage ? undefined : 'rgba(10,10,10,0.95)',
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
