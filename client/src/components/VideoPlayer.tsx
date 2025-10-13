import React from 'react';
import { motion } from 'framer-motion';

const VideoPlayer: React.FC = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div 
          className="relative aspect-video w-full overflow-hidden rounded-lg shadow-2xl"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <video
            className="absolute top-0 left-0 w-full h-full object-cover"
            src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4"
            poster="https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80&auto=format&fit=crop"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="absolute inset-0 bg-black/20" />
        </motion.div>
      </div>
    </section>
  );
};

export default VideoPlayer;
