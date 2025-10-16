import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const AboutIntroSection: React.FC = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_HOST}/api/media/list?path=home/intro`, { signal: controller.signal });
        const json = await res.json().catch(() => ({ items: [] }));
        if (json.items && json.items.length >= 4) {
          setImages(json.items.slice(0, 4).map((item: any) => 
            item.url.startsWith('/') ? `${API_HOST}${item.url}` : item.url
          ));
        }
      } catch (_) {}
    })();
    return () => controller.abort();
  }, [API_HOST]);
  return (
    <section className="relative w-full bg-secondary py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-white mb-6 tracking-wide">
              Capturing Your Story
            </h2>
            <p className="text-muted text-lg leading-relaxed mb-6">
              Every couple has a unique story to tell. I focus on the authentic moments, 
              genuine emotions, and quiet details that make your love story yours.
            </p>
            <p className="text-cursive text-accent mb-8">
              "Photography is about finding beauty in the ordinary moments"
            </p>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-light text-sm">Documentary-style storytelling</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-light text-sm">Authentic, unposed moments</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-light text-sm">Timeless, elegant imagery</span>
              </div>
            </div>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="space-y-4">
              <div className="aspect-[3/4] overflow-hidden bg-primary/50">
                {images[0] && (
                  <img
                    src={images[0]}
                    alt="Wedding portrait"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="aspect-[4/3] overflow-hidden bg-primary/50">
                {images[1] && (
                  <img
                    src={images[1]}
                    alt="Wedding details"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="aspect-[4/3] overflow-hidden bg-primary/50">
                {images[2] && (
                  <img
                    src={images[2]}
                    alt="Couple moment"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="aspect-[3/4] overflow-hidden bg-primary/50">
                {images[3] && (
                  <img
                    src={images[3]}
                    alt="Wedding ceremony"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default AboutIntroSection;
