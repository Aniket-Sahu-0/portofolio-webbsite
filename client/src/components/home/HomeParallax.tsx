import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { API_HOST } from '../../utils/media';

const HomeParallax = () => {
  const [bgUrl, setBgUrl] = useState<string>('');

  useEffect(() => {
    fetch(`${API_HOST}/api/database/category/gallery/portraits`)
      .then(r => r.json())
      .then(d => {
        const images: any[] = d?.data?.images ?? [];
        const first = images[0];
        if (!first) return;
        const url: string = first.url ?? '';
        setBgUrl(url.startsWith('/') ? `${API_HOST}${url}` : url);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      {/* background-attachment:fixed = image stays pinned to viewport while the
          section frame scrolls over it. The overflow:hidden on the parent clips it
          so only the section area is visible — exactly the "window past the image" feel. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundColor: '#1a1008',
        }}
      />

      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-[#c9a96e] text-[0.65rem] tracking-[0.45em] uppercase mb-5"
        >
          The Wedding Shade
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.95, delay: 0.1 }}
          className="font-serif italic text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] text-white max-w-4xl leading-[1.1] mb-8"
        >
          Every frame is a promise to preserve what truly matters.
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.75, delay: 0.28 }}
          className="w-20 h-px mb-9"
          style={{ background: '#c9a96e', originX: 0.5 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.38 }}
          className="flex items-center gap-10 sm:gap-16"
        >
          {[
            { value: '200+', label: 'Couples' },
            { value: '8 yrs', label: 'Experience' },
            { value: 'India', label: '& Beyond' },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && <div className="w-px h-8 bg-white/20 flex-shrink-0" />}
              <div className="text-center">
                <p className="text-white font-sans font-bold text-2xl sm:text-3xl leading-none">{stat.value}</p>
                <p className="text-white/50 text-[0.6rem] tracking-widest uppercase mt-1.5">{stat.label}</p>
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomeParallax;
