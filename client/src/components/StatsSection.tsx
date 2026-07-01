import React from 'react';

const stats = [
  { value: '500+', label: 'Happy Clients' },
  { value: '5k+', label: 'Photos Taken' },
  { value: '100%', label: 'Satisfaction' },
];

const StatsSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-primary py-16 md:py-24">
      {/* soft warm glow for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_65%_at_50%_50%,rgba(139,115,85,0.08),transparent_72%)]" />

      <div className="container relative">
        <p className="mb-10 text-center text-[0.7rem] uppercase tracking-[0.32em] text-accent md:mb-12">
          By the numbers
        </p>

        <div className="mx-auto grid max-w-3xl grid-cols-3 divide-x divide-white/10">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center px-2 text-center">
              <span className="font-serif text-4xl leading-none text-white sm:text-5xl md:text-6xl">
                {stat.value}
              </span>
              <span className="mt-3 text-[0.6rem] uppercase leading-tight tracking-[0.18em] text-gray-400 sm:text-xs">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
