import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const panelData = [
  {
    title: "My Story, My Vision",
    description1: "I believe photography is more than just taking pictures. It's about capturing the raw, honest, and unfussy moments that tell a unique story.",
    description2: "My approach is to blend into the background, documenting the genuine emotions and connections that unfold naturally.",
  },
  {
    title: "The Unseen Moments",
    description1: "From the quiet tear to the burst of laughter, these are the moments that matter.",
    description2: "My goal is to create a visual narrative that you'll cherish for a lifetime, filled with authenticity and love.",
  },
  {
    title: "Let's Create Together",
    description1: "Your story is unique, and your photographs should be too. Let's collaborate to create something beautiful and timeless.",
    description2: "",
  },
];

const AboutTeaser: React.FC = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const [images, setImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });

  const panels = useMemo(() => {
    return panelData.map((panel, idx) => ({
      ...panel,
      images: [images[idx * 2] || '', images[idx * 2 + 1] || '']
    }));
  }, [images]);

  const panelIndex = useTransform(scrollYProgress, [0, 1], [0, Math.max(panels.length, 1)]);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_HOST}/api/database/category/home/about_teaser`, { signal: controller.signal });
        const json = await res.json().catch(() => ({ data: { images: [] } }));
        if (json.data?.images && json.data.images.length >= 6) {
          setImages(json.data.images.slice(0, 6).map((item: any) => 
            item.url.startsWith('/') ? `${API_HOST}${item.url}` : item.url
          ));
        }
      } catch (_) {}
    })();
    return () => controller.abort();
  }, [API_HOST]);

  useEffect(() => {
    return panelIndex.onChange((latest) => {
      const newIndex = Math.floor(latest);
      if (newIndex >= 0 && newIndex < panels.length) {
        setCurrentPanel(newIndex);
      }
    });
  }, [panelIndex]);

  const currentPanelData = panels[currentPanel] || { title: '', description1: '', description2: '', images: [] };

  return (
    <section ref={scrollRef} className="relative bg-primary" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Luxury dark photography background */}
        <div className="absolute inset-0 -z-10">
          {/* Deep black base */}
          <div className="absolute inset-0 bg-primary" />
          {/* Gold accent tint overlay */}
          <div className="absolute inset-0 bg-accent/5" />
          {/* Subtle luxury vignette effect */}
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'radial-gradient(80% 80% at 50% 20%, rgba(139,115,85,0.08), transparent 65%)' 
            }} 
          />
        </div>
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Dual Portrait Images - Leaner Layout */}
            <div className="relative h-[400px] lg:h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentPanel + '-img1'}
                  className="absolute top-0 left-0 w-2/3 h-2/3 rounded-lg overflow-hidden shadow-xl"
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {currentPanelData.images[0] ? (
                    <img 
                      src={currentPanelData.images[0]}
                      alt="Portrait one"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/50" />
                  )}
                </motion.div>
                <motion.div 
                  key={currentPanel + '-img2'}
                  className="absolute bottom-0 right-0 w-2/3 h-2/3 rounded-lg overflow-hidden border-8 border-rich shadow-2xl"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {currentPanelData.images[1] ? (
                    <img 
                      src={currentPanelData.images[1]}
                      alt="Portrait two"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/50" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Story Text */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPanel}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white mb-6">
                    {currentPanelData.title}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {currentPanelData.description1}
                  </p>
                  {currentPanelData.description2 && (
                    <p className="text-gray-300 mb-8 leading-relaxed">
                      {currentPanelData.description2}
                    </p>
                  )}
                  <Link 
                    to="/about"
                    className="inline-flex items-center text-accent font-medium group"
                  >
                    Learn More About Me
                    <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutTeaser;
