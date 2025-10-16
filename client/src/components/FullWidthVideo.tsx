import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FullWidthVideo: React.FC = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_HOST}/api/media/list?path=home/video`, { signal: controller.signal });
        const json = await res.json().catch(() => ({ items: [] }));
        if (json.items && json.items.length > 0) {
          // Find first video
          const video = json.items.find((item: any) => item.type === 'video');
          if (video) {
            setVideoUrl(video.url.startsWith('/') ? `${API_HOST}${video.url}` : video.url);
          }
          // Find first image for poster
          const poster = json.items.find((item: any) => item.type === 'image');
          if (poster) {
            setPosterUrl(poster.url.startsWith('/') ? `${API_HOST}${poster.url}` : poster.url);
          }
        }
      } catch (_) {}
    })();
    return () => controller.abort();
  }, [API_HOST]);

  // Ensure video plays inline on mobile
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Autoplay prevented:", error);
      });
    }
  }, []);

  return (
    <div className="w-full bg-black">
      <section className="relative w-full h-[50vh] min-h-[500px] overflow-hidden mx-auto">
        {/* Video Background */}
        {videoUrl ? (
          <video
            ref={videoRef}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
            muted
            loop
            playsInline
            autoPlay
            poster={posterUrl || undefined}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full bg-primary/80" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/30 z-1"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12">
            <motion.div 
              className="max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Capturing Life's <span className="text-accent">Precious</span> Moments
              </h2>
              <p className="text-gray-200 text-xl mb-8 max-w-2xl">
                Professional photography that tells your unique story through authentic and emotional imagery.
              </p>
              <Link 
                to="/about"
                className="group inline-flex items-center px-10 py-4 border-2 border-accent text-lg font-medium rounded-none text-white bg-accent/90 hover:bg-transparent hover:text-accent transition-all duration-300"
              >
                Learn More
                <svg 
                  className="ml-3 w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FullWidthVideo;
