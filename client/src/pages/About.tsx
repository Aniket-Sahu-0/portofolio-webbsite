import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { animate, motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useLenis } from 'lenis/react';
import { Instagram, Facebook, Mail } from 'lucide-react';
import OptimizedImage from '../components/media/OptimizedImage';

const FLIP_SPRING = { stiffness: 100, damping: 26, mass: 0.5 };

// ─── Testimonial flip card (hover) ────────────────────────────────────────────
const TestimonialFlipCard = ({
  front,
  back,
  className = '',
}: {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.65, ease: [0.23, 1, 0.32, 1] }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        <div style={{ backfaceVisibility: 'hidden' }} className="absolute inset-0">{front}</div>
        <div style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0">{back}</div>
      </motion.div>
    </div>
  );
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const services = [
  {
    name: 'Weddings',
    description: 'Documenting love stories from the first look to the last dance — every emotion, unposed and alive.',
    tags: ['Candid', 'Pre-Wedding', 'Traditional', 'Cinematic'],
  },
  {
    name: 'Corporate',
    description: 'Elevating your brand through visual storytelling that commands attention and builds trust.',
    tags: ['Official Events', 'Conferences', 'Product Launches', 'Team Portraits'],
  },
  {
    name: 'Studio',
    description: 'Controlled elegance — portraits crafted with light, shadow, and pure intention.',
    tags: ['Portraits', 'Headshots', 'Fashion', 'Fine Art'],
  },
  {
    name: 'Events',
    description: 'Every milestone deserves to be remembered in full colour, for generations to come.',
    tags: ['Maternity', 'Baby Shoot', 'Modelling Session', 'Casual Shoot'],
  },
];

const testimonials = [
  {
    couple: 'Riya & Arjun',
    date: 'March 2025',
    quote: "Mohit didn't just capture our wedding — he captured the feeling of it. Every photo tells a story we never want to forget.",
    gradient: 'from-[#2a1f14] to-[#1a1208]',
  },
  {
    couple: 'Priya & Rohan',
    date: 'November 2024',
    quote: "From our pre-wedding shoot to the reception, every frame felt cinematic. We couldn't be happier with how beautifully our day was preserved.",
    gradient: 'from-[#14201a] to-[#0c1510]',
  },
  {
    couple: 'Sneha & Vikram',
    date: 'February 2025',
    quote: 'The candid shots were absolutely breathtaking. Mohit has a rare gift for finding the perfect moment in the middle of beautiful chaos.',
    gradient: 'from-[#1a1520] to-[#100c15]',
  },
  {
    couple: 'Ananya & Nikhil',
    date: 'January 2025',
    quote: 'We felt completely at ease throughout the shoot. The photos look like they belong in a magazine — truly world-class work.',
    gradient: 'from-[#201418] to-[#150c10]',
  },
];

const thoughts = [
  {
    date: 'May 12, 2025',
    title: 'The Language of Light',
    excerpt: 'How golden hour changes not just the image, but the entire emotional register of a moment.',
  },
  {
    date: 'Jun 3, 2025',
    title: 'Stillness in Motion',
    excerpt: 'The art of capturing movement without losing the quiet truth that lives inside every frame.',
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────
const About = () => {
  const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const API_HOST = useMemo(() => (API_BASE as string).replace(/\/api\/?$/, ''), [API_BASE]);
  const abs = (u: string | undefined | null) =>
    u ? (u.startsWith('/') ? `${API_HOST}${u}` : u) : '';

  const [portraitUrl, setPortraitUrl] = useState<string | null>(null);
  const [coupleUrls, setCoupleUrls] = useState<string[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        // Each About panel reads its own media folder, so add/remove in the folder
        // is reflected here: about/portrait (flip card) + about/testimonials (cards,
        // in filename order).
        const [portraitRes, coupleRes] = await Promise.all([
          fetch(`${API_HOST}/api/database/category/about/portrait`, { signal: ctrl.signal }),
          fetch(`${API_HOST}/api/database/category/about/testimonials`, { signal: ctrl.signal }),
        ]);
        const p = await portraitRes.json().catch(() => ({ data: { images: [] } }));
        const c = await coupleRes.json().catch(() => ({ data: { images: [] } }));
        const pImgs: any[] = p.data?.images ?? p.images ?? [];
        const cImgs: any[] = c.data?.images ?? c.images ?? [];
        if (pImgs[0]) setPortraitUrl(abs(pImgs[0].url));
        setCoupleUrls(cImgs.slice(0, 4).map((i: any) => abs(i.url)));
      } catch (_) {}
    })();
    return () => ctrl.abort();
  }, [API_HOST]);

  // ── Portrait flip — wheel-driven, scroll-locked until complete ──────────────
  const cardRef     = useRef<HTMLDivElement>(null);
  const lenis       = useLenis();
  const rawProgress = useMotionValue(0);
  const rawRotateY  = useTransform(rawProgress, [0, 0.7], [0, 180]);
  const rawScale    = useTransform(rawProgress, [0, 0.7], [0.82, 1]);
  const rotateY    = useSpring(rawRotateY, FLIP_SPRING);
  const cardScale  = useSpring(rawScale,   FLIP_SPRING);


  // Mobile: auto-play the flip once on mount — no scroll lock, no wheel needed.
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    const t = setTimeout(() => {
      animate(rawProgress, 1, { duration: 1.3, ease: [0.16, 1, 0.3, 1] });
    }, 800);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Desktop: stop Lenis, drive the flip from wheel scroll, release when done.
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    lenis?.stop();

    let progress  = 0;
    let released  = false;

    const release = () => {
      if (released) return;
      released = true;
      window.removeEventListener('wheel', onWheel, { capture: true } as any);
      lenis?.start();
    };

    const onWheel = (e: WheelEvent) => {
      if (released) return;
      e.preventDefault();
      progress = Math.max(0, Math.min(1, progress + e.deltaY / 420));
      rawProgress.set(progress);
    };

    const unsub = rotateY.on('change', (val) => {
      if (progress >= 0.7 && val >= 176) release();
    });

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true } as any);
      unsub();
      lenis?.start();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lenis]);

  return (
    <div className="bg-primary text-light min-h-screen">

      {/* ── Hero + Portrait (integrated sticky layout) ────────────────── */}
      <section style={{ minHeight: '160vh' }} className="relative">
        <div className="sticky top-0 h-screen flex items-center px-6 sm:px-12 lg:px-20 pt-16">
          <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-10 lg:gap-12">

            {/* Left — text */}
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="mb-6"
              >
                <p className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-muted-light leading-none mb-1">
                  Visual
                </p>
                <h1 className="font-sans font-black text-6xl sm:text-7xl md:text-8xl lg:text-[9rem] leading-[0.88] tracking-tighter text-white">
                  Story<span className="text-accent">teller</span>.
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="text-muted-light text-lg md:text-xl leading-relaxed max-w-xl mb-8"
              >
                I'm Mohit — a visual storyteller based in India. I craft timeless images
                that hold the weight of real emotion, from intimate weddings to bold corporate
                stages. Every frame I take is a promise to preserve what truly matters.
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-muted text-sm tracking-wide">Available for bookings in 2025</span>
              </motion.div>
            </div>

            {/* Right — portrait card */}
            <motion.div
              ref={cardRef}
              style={{ perspective: '1200px', scale: cardScale }}
              className="w-[13rem] h-[17rem] sm:w-[19rem] sm:h-[25rem] md:w-[24rem] md:h-[31rem] lg:w-[27rem] lg:h-[35rem] flex-shrink-0"
            >
              <motion.div
                style={{ rotateY, transformStyle: 'preserve-3d' }}
                className="relative w-full h-full"
              >
                {/* Front — B&W */}
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                >
                  {portraitUrl ? (
                    <img
                      src={portraitUrl}
                      alt="Mohit"
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(1) brightness(0.8)' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#2a2010] to-[#0a0a0a]" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Back — full colour */}
                <div
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                >
                  {portraitUrl ? (
                    <img
                      src={portraitUrl}
                      alt="Mohit"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-accent" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-white font-sans font-bold text-2xl">Mohit</p>
                    <p className="text-white/60 text-xs tracking-widest uppercase mt-1">Visual Storyteller</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 lg:px-20 border-t border-border/30">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-14 flex-wrap gap-4"
          >
            <h2 className="font-sans font-bold text-4xl sm:text-5xl text-white">/Services</h2>
            <p className="text-muted text-sm">Four pillars of photography, crafted to tell your unique story.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/20">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className="bg-primary p-8 md:p-10 group hover:bg-secondary/40 transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-sans font-bold text-2xl md:text-3xl text-white group-hover:text-accent transition-colors duration-300">
                    {svc.name}
                  </h3>
                  <span className="text-muted text-xs tracking-widest mt-1">0{i + 1}</span>
                </div>
                <p className="text-muted-light text-sm leading-relaxed mb-6">{svc.description}</p>
                <div className="flex flex-wrap gap-2">
                  {svc.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs font-sans tracking-wide bg-secondary text-muted-light border border-border/40 group-hover:border-accent/20 transition-colors duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 lg:px-20 border-t border-border/30">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-end justify-between mb-14 flex-wrap gap-4"
          >
            <h2 className="font-sans font-bold text-4xl sm:text-5xl text-white">/Testimonials</h2>
            <p className="text-muted text-sm">Hover the cards to read their stories.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.couple}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.1 }}
              >
                <TestimonialFlipCard
                  className="h-80"
                  front={
                    <div className={`w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br ${t.gradient} relative flex flex-col justify-end p-6`}>
                      {coupleUrls[i] && (
                        <>
                          <OptimizedImage
                            src={coupleUrls[i]}
                            alt={t.couple}
                            width={640}
                            quality={72}
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover rounded-2xl opacity-60"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent rounded-2xl" />
                        </>
                      )}
                      <div className="relative z-10">
                        <p className="text-white font-sans font-semibold text-lg">{t.couple}</p>
                        <p className="text-white/50 text-xs tracking-wider mt-1">{t.date}</p>
                      </div>
                    </div>
                  }
                  back={
                    <div className="w-full h-full rounded-2xl bg-secondary border border-border/30 flex flex-col justify-between p-6">
                      <span className="text-accent text-3xl leading-none">"</span>
                      <p className="text-light text-sm leading-relaxed">{t.quote}</p>
                      <div>
                        <div className="w-8 h-px bg-accent/40 mb-3" />
                        <p className="text-white font-sans font-semibold text-sm">{t.couple}</p>
                        <p className="text-muted text-xs mt-0.5">{t.date}</p>
                      </div>
                    </div>
                  }
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Thoughts ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 lg:px-20 border-t border-border/30" style={{ background: '#141414' }}>
        <div className="max-w-[1400px] mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-sans font-bold text-5xl sm:text-6xl text-white mb-12"
          >
            Thoughts
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl bg-[#1c1c1c] p-7 flex flex-col justify-between min-h-80"
            >
              <p className="text-white/40 text-sm mb-6">May 5, 2025</p>
              <div>
                <p className="text-white/50 text-xs tracking-widest uppercase mb-3">For Couples</p>
                <h3 className="text-white font-sans font-bold text-2xl leading-snug mb-4">
                  Building trust through clear visual storytelling
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  Your wedding photos are the one thing you'll keep forever. We make sure they feel exactly like that day did.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl bg-[#1c1c1c] p-7 flex flex-col justify-between min-h-80"
            >
              <p className="text-white/40 text-sm mb-6">Jun 16, 2025</p>
              <div>
                <p className="text-white/50 text-xs tracking-widest uppercase mb-3">Art Direction</p>
                <h3 className="text-white font-sans font-bold text-2xl leading-snug mb-4">
                  The role of art in making your day impossible to forget
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  The stolen glances, the happy tears, the chaos of the dance floor — we capture it all before it slips away.
                </p>
              </div>
            </motion.div>

            {/* Card 3 — CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-2xl bg-[#111111] p-7 flex flex-col justify-between min-h-80"
            >
              <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white leading-snug">
                See how we turn your wedding day into memories you'll relive forever
              </h3>
              <div>
                <p className="text-white/40 text-sm leading-relaxed mb-6">
                  Browse real couples, real moments, no posed perfection.
                </p>
                <Link
                  to="/gallery"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-sans font-semibold text-sm hover:bg-white/90 transition-all duration-200"
                >
                  View all work <span>↗</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Let's Talk ────────────────────────────────────────────────── */}
      <section className="py-24 px-6 sm:px-12 lg:px-20 border-t border-border/30 bg-secondary/30">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-accent text-sm tracking-[0.3em] uppercase font-sans mb-3">Ready?</p>
            <h2 className="font-sans font-black text-5xl sm:text-6xl md:text-7xl text-white leading-[0.95]">
              Let's Talk.
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col gap-4"
          >
            <p className="text-muted-light text-base leading-relaxed max-w-sm">
              Have a story worth telling? Let's make something beautiful together.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 self-start px-8 py-4 bg-accent hover:bg-accent-light text-white font-sans font-semibold text-sm tracking-widest uppercase rounded-full transition-all duration-300 group"
            >
              Enquire Now
              <span className="translate-x-0 group-hover:translate-x-1 transition-transform duration-200">→</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/30 bg-primary">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-20 pt-16 pb-6">

          {/* Big statement + links */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12 mb-16">
            <h2 className="font-sans font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white leading-[0.92] max-w-xl">
              Capturing<br />Moments<br />
              <span className="text-accent">Forever.</span>
            </h2>

            <div className="flex flex-col sm:flex-row gap-14">
              <div>
                <p className="text-accent font-sans text-xs tracking-[0.25em] uppercase mb-5">/Quick Links</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {[
                    { label: 'Home', to: '/' },
                    { label: 'Gallery', to: '/gallery' },
                    { label: 'About', to: '/about' },
                    { label: 'Contact', to: '/contact' },
                  ].map(link => (
                    <Link
                      key={link.label}
                      to={link.to}
                      className="px-4 py-2 rounded-full text-xs font-sans tracking-wide bg-secondary text-muted-light border border-border/40 hover:border-accent/40 hover:text-white transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                {/* Social icons */}
                <div className="flex items-center gap-4">
                  <a
                    href="https://www.instagram.com/theweddingshade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="https://www.facebook.com/theweddingshade"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted hover:text-white transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="mailto:mohit@theweddingshade.com"
                    className="text-muted hover:text-white transition-colors duration-200"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-accent font-sans text-xs tracking-[0.25em] uppercase mb-5">/Contact</p>
                <a
                  href="mailto:mohit@theweddingshade.com"
                  className="text-muted-light hover:text-white transition-colors duration-200 text-sm"
                >
                  mohit@theweddingshade.com
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/20 pt-6">
            <p className="text-muted text-xs tracking-widest">
              © {new Date().getFullYear()} The Wedding Shade. All rights reserved.
            </p>
          </div>
        </div>

        {/* Large MOHIT watermark */}
        <div className="overflow-hidden select-none pointer-events-none -mt-2">
          <p className="font-sans font-black text-[24vw] leading-none tracking-tight text-white/[0.04] whitespace-nowrap px-4">
            MOHIT
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;
