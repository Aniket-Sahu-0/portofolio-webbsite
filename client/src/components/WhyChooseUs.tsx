import React from 'react';
import { motion } from 'framer-motion';

type Testimonial = {
  name: string;
  text: string;
  rating: number; // 0-5
};

const testimonials: Testimonial[] = [
  { name: 'Ananya & Raghav', text: 'Felt like friends with cameras — every moment was real.', rating: 5 },
  { name: 'Mira S.', text: 'Elegant, honest, and beautifully calm throughout.', rating: 5 },
  { name: 'Arjun K.', text: 'Zero posing pressure. The photos feel like us.', rating: 4 },
  { name: 'Dev & Samaira', text: 'Tone, timing, and taste — everything just clicked.', rating: 5 },
  { name: 'Ishaan T.', text: 'Quiet presence; powerful frames.', rating: 5 },
];

const Stars = ({ rating }: { rating: number }) => (
  <span className="text-accent/90 mr-2">
    {'★★★★★'.slice(0, Math.max(0, Math.min(5, rating)))}
  </span>
);

const WhyChooseUs: React.FC = () => {
  const items = testimonials.map((t, i) => (
    <span key={`t-${i}`} className="mx-10 inline-flex items-center text-light">
      <Stars rating={t.rating} />
      <span className="font-serif text-lg md:text-2xl">"{t.text}"</span>
      <span className="ml-3 text-muted text-sm md:text-base">— {t.name}</span>
    </span>
  ));

  return (
    <section className="relative w-full bg-secondary py-8">
      {/* edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-secondary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-secondary to-transparent" />

      <div className="overflow-hidden">
        <motion.div
          aria-label="Client testimonials"
          initial={{ x: 0 }}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="whitespace-nowrap py-3"
        >
          {items}
          {items}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
