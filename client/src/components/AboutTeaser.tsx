import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const panels = [
  {
    title: "My Story, My Vision",
    description1: "I believe photography is more than just taking pictures. It's about capturing the raw, honest, and unfussy moments that tell a unique story.",
    description2: "My approach is to blend into the background, documenting the genuine emotions and connections that unfold naturally.",
    images: [
      "https://images.unsplash.com/photo-1542596594-649ed6e6b342?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1589571894960-204526740f40?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    title: "The Unseen Moments",
    description1: "From the quiet tear to the burst of laughter, these are the moments that matter.",
    description2: "My goal is to create a visual narrative that you'll cherish for a lifetime, filled with authenticity and love.",
    images: [
      "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop"
    ]
  },
  {
    title: "Let's Create Together",
    description1: "Your story is unique, and your photographs should be too. Let's collaborate to create something beautiful and timeless.",
    description2: "",
    images: [
      "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520367445533-93201a35a52a?q=80&w=800&auto=format&fit=crop"
    ]
  },
];

const AboutTeaser: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });

  const panelIndex = useTransform(scrollYProgress, [0, 1], [0, panels.length]);
  const [currentPanel, setCurrentPanel] = useState(0);

  useEffect(() => {
    return panelIndex.onChange((latest) => {
      const newIndex = Math.floor(latest);
      if (newIndex >= 0 && newIndex < panels.length) {
        setCurrentPanel(newIndex);
      }
    });
  }, [panelIndex]);

  const { title, description1, description2, images } = panels[currentPanel];
  // Choose one of the two foreground images as a blurred background for the panel
  const bgSrc = images[currentPanel % 2];

  return (
    <section ref={scrollRef} className="relative bg-rich" style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        {/* Blurred background that changes with each panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bg-${currentPanel}-${bgSrc}`}
            className="absolute inset-0 -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <img
              src={bgSrc}
              alt="Background"
              className="w-full h-full object-cover scale-110 blur-3xl opacity-50"
              loading="lazy"
            />
            {/* gentle dark overlay for readability */}
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>
        </AnimatePresence>
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
                  <img 
                    src={images[0]}
                    alt="Portrait one"
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div 
                  key={currentPanel + '-img2'}
                  className="absolute bottom-0 right-0 w-2/3 h-2/3 rounded-lg overflow-hidden border-8 border-rich shadow-2xl"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  <img 
                    src={images[1]}
                    alt="Portrait two"
                    className="w-full h-full object-cover"
                  />
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
                    {title}
                  </h2>
                  <p className="text-gray-300 mb-6 leading-relaxed">
                    {description1}
                  </p>
                  {description2 && (
                    <p className="text-gray-300 mb-8 leading-relaxed">
                      {description2}
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
