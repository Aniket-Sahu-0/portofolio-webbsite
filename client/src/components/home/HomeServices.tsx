import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, MotionValue, useMotionValue, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Camera, Film, Images, Mail, Quote, Sparkles } from 'lucide-react';
import OptimizedImage from '../media/OptimizedImage';
import { loadFolderImages } from '../../utils/media';
import { optimizeImageUrl } from '../../utils/imageOptimizer';
import { useIsTouch } from '../../utils/useIsTouch';
import MobileReveal from './MobileReveal';

const services = [
  { title: 'Wedding Day', copy: 'Documentary coverage, family frames, portraits, and the in-between moments that carry the day.', Icon: Camera },
  { title: 'Portrait Sessions', copy: 'Pre-wedding, couple, and editorial portraits with calm direction and clean styling.', Icon: Images },
  { title: 'Wedding Films', copy: 'Short films, highlight edits, and motion-led keepsakes made for sharing and replaying.', Icon: Film },
];

const reviews = [
  { quote: 'Every image feels like the room sounded: warm, full, and completely ours.', name: 'Ananya & Raghav' },
  { quote: 'The portraits were elegant, but the quiet candid frames are what still stop us.', name: 'Mira & Sam' },
];

// Each panel reads its image(s) live from its own media folder, so dropping or
// removing files in these folders is reflected on the site automatically:
//   media/home/approach/  -> [0] = Approach panel image
//   media/home/notes/     -> [0..] = Notes card backgrounds (filename order)
//   media/home/bookings/  -> [0] = Bookings panel image
// Empty folder = the panel just shows its background, no broken image.

const PANEL_COUNT = 4;
const LAST = PANEL_COUNT - 1;
// Extra scroll (in viewport units) after the last card centers, so the deck eases
// out and the scene cross-fades into the dark footer instead of hard-cutting. The
// continuous "active card" position is `progress * TRAVEL`, which reaches LAST a
// beat before progress hits 1 (the release point), leaving room for the outro.
// Small beat after the last card centers so it doesn't sit exactly at the release
// edge (which would feel like a snap), then it scrolls straight off into the footer.
const OUTRO = 0.25;
const TRAVEL = LAST + OUTRO;

type CardProps = {
  index: number;
  progress: MotionValue<number>;
  className: string;
  label: string;
  children: React.ReactNode;
};

// `progress` is 0..1 across the pinned scroll. `a = progress * TRAVEL` is the
// continuous "active card" position, so `d = index - a` is how far this card is
// from being centered: d > 0 = still queued below, d ~ 0 = front and center,
// d < 0 = pushed back into the stack. Everything is a pure function of scroll,
// so the deck scrubs with the finger and there is no event hijacking.
const ServiceCard: React.FC<CardProps> = ({ index, progress, className, label, children }) => {
  const transform = useTransform(progress, (p) => {
    const d = index - p * TRAVEL;
    if (d >= 0) {
      // Queued/active: sits below and slides up to center as the deck advances.
      return `translate3d(0, calc(-50% + ${(d * 104).toFixed(2)}vh), 0) scale(1)`;
    }
    const depth = -d;
    const scale = 1 - Math.min(depth, 3) * 0.035;
    return `translate3d(0, calc(-50% - ${(Math.min(depth, 4) * 18).toFixed(2)}px), 0) scale(${scale.toFixed(4)})`;
  });
  // No visibility toggle — keep all cards composited so images are pre-painted before animating in.
  const pointerEvents = useTransform(progress, (p) => (Math.abs(index - p * TRAVEL) < 0.5 ? 'auto' : 'none'));
  const contentOpacity = useTransform(progress, (p) => {
    const d = index - p * TRAVEL;
    return d >= 0 ? 1 : Math.max(0, 1 - Math.max(-d - 0.4, 0));
  });
  const overlayOpacity = useTransform(progress, (p) => {
    const d = index - p * TRAVEL;
    return d < -0.1 ? Math.min(-d, 1) * 0.18 : 0;
  });

  return (
    <motion.article
      className={`absolute flex origin-center overflow-hidden rounded-[1rem] border shadow-[0_24px_70px_rgba(0,0,0,0.22)] ring-1 ring-inset ring-white/10 sm:rounded-[1.25rem] md:rounded-[1.5rem] md:shadow-[0_34px_90px_rgba(0,0,0,0.24)] ${className}`}
      style={{
        left: 'clamp(0.85rem, 4vw, 7rem)',
        right: 'clamp(0.85rem, 4vw, 7rem)',
        top: 'calc(50vh + clamp(1.5rem, 4vh, 2.25rem))',
        height: 'min(74vh, calc(100vh - 8.75rem), 640px)',
        transform,
        pointerEvents,
        zIndex: index + 2,
        willChange: 'transform',
      }}
    >
      <div className="pointer-events-none absolute left-4 top-4 z-30 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] opacity-70 sm:left-6 sm:top-6">
        <span>{String(index + 1).padStart(2, '0')}</span>
        <span className="h-px w-8 bg-current" />
        <span>{label}</span>
      </div>
      <motion.div className="relative z-10 flex h-full w-full" style={{ opacity: contentOpacity, willChange: 'opacity' }}>
        {children}
      </motion.div>
      <motion.div className="pointer-events-none absolute inset-0 z-20 bg-black" style={{ opacity: overlayOpacity }} />
    </motion.article>
  );
};

const HomeServices: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useMotionValue(0);
  const currentPanel = useRef(0);
  const lastAdvanceTime = useRef(-Infinity);
  const isExiting = useRef(false);
  const isTouch = useIsTouch();
  // Desktop-only effects (wheel hijack + scroll sync) gate on this ref.
  const isTouchDevice = useRef(isTouch);

  // Panel imagery, read live from each panel's media folder.
  const [rawImageUrl, setRawImageUrl] = useState('');
  const [bookingImageUrl, setBookingImageUrl] = useState('');
  const [reviewImageUrls, setReviewImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      const [approach, notes, bookings] = await Promise.all([
        loadFolderImages('home/approach', { signal: ctrl.signal }),
        loadFolderImages('home/notes', { signal: ctrl.signal }),
        loadFolderImages('home/bookings', { signal: ctrl.signal }),
      ]);
      if (approach[0]) setRawImageUrl(approach[0].url);
      setReviewImageUrls(notes.map((i) => i.url));
      if (bookings[0]) setBookingImageUrl(bookings[0].url);
    })();
    return () => ctrl.abort();
  }, []);

  // Warm the Notes background images so they are GPU-ready before animating in.
  // These are CSS backgrounds, so they bypass OptimizedImage's eager loading —
  // pre-decode the SAME optimized URL the panel renders (not the ~2 MB original).
  // Approach and Bookings already load eagerly through OptimizedImage.
  useEffect(() => {
    reviewImageUrls.filter(Boolean).forEach((url) => {
      const img = new Image();
      img.src = optimizeImageUrl(url, { width: 800, quality: 70 });
    });
  }, [reviewImageUrls]);

  // Sync initial panel from scroll position (handles refresh / back-button restore).
  useEffect(() => {
    if (isTouchDevice.current) return; // mobile uses scrollYProgress above
    const section = sectionRef.current;
    if (!section) return;
    const scrollInSection = Math.max(0, window.scrollY - section.offsetTop);
    const panel = Math.min(PANEL_COUNT - 1, Math.floor(scrollInSection / window.innerHeight));
    currentPanel.current = panel;
    progress.set(panel / TRAVEL);
  }, [progress]);

  // One wheel gesture = one panel advance. Desktop only — touch uses scrollYProgress.
  useEffect(() => {
    if (isTouchDevice.current) return;
    const section = sectionRef.current;
    if (!section) return;

    // A panel advance fires when:
    //   • COOLDOWN_MS has elapsed since the last advance (matches animation duration)
    //   • |deltaY| > MIN_DELTA — filters sub-pixel inertia tail events
    // No silence gate: removing the "wait 80 ms for event stream to go quiet"
    // gate is what makes it feel like sohub. The silence gate was causing the
    // "stuck" feeling on Windows touchpad (inertia lasts 1-2 s, so the gate
    // forced a 1-2 s wait before every advance). With only the cooldown, the
    // animation plays (650 ms), inertia events are eaten, then the very next
    // deliberate swipe advances immediately.
    const COOLDOWN_MS = 650;   // matches tween duration below
    const MIN_DELTA = 2;       // ignore sub-pixel inertia tail

    // Resets isExiting once the smooth exit scroll finishes and the section
    // is no longer in the sticky zone.
    const handleScroll = () => {
      if (!isExiting.current) return;
      const rect = section.getBoundingClientRect();
      if (rect.top > 1 || rect.bottom < window.innerHeight - 1) {
        isExiting.current = false;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      // During exit: eat events while the section is still stuck so the short
      // smooth scroll isn't interrupted; release as soon as it un-sticks.
      if (isExiting.current) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 1 && rect.bottom >= window.innerHeight - 1) e.preventDefault();
        return;
      }

      const rect = section.getBoundingClientRect();
      const isStuck = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
      if (!isStuck) return;

      const now = performance.now();
      const direction = Math.sign(e.deltaY);

      // Eat everything while cooldown is active — this absorbs touchpad inertia.
      const cooldownExpired = now - lastAdvanceTime.current >= COOLDOWN_MS;
      if (!cooldownExpired || direction === 0 || Math.abs(e.deltaY) < MIN_DELTA) {
        e.preventDefault();
        return;
      }

      // New gesture, cooldown elapsed — first event of a deliberate swipe.
      e.preventDefault();

      const next = currentPanel.current + direction;

      if (next < 0 || next >= PANEL_COUNT) {
        // Boundary: sync the real scroll position to the virtual panel position
        // (invisible because the sticky element doesn't move visually within its
        // range), then smooth-scroll the ~0.25 vh needed to actually un-stick.
        // Two rAFs push both calls outside the wheel-event callstack so Chrome's
        // compositor can re-sync before the smooth scroll starts.
        isExiting.current = true;
        const syncY = section.offsetTop + currentPanel.current * window.innerHeight;
        const exitY = direction > 0
          ? section.offsetTop + section.offsetHeight - window.innerHeight + 10
          : Math.max(0, section.offsetTop - 10);
        requestAnimationFrame(() => {
          document.documentElement.scrollTop = syncY;
          requestAnimationFrame(() => {
            window.scrollTo({ top: exitY, behavior: 'smooth' });
          });
        });
        return;
      }

      // Non-boundary: record advance time and animate.
      // Deliberately do NOT touch scrollTop — any programmatic scroll change
      // triggers Chrome's compositor to re-route touchpad wheel events away from
      // the JS handler until the next pointer move ("need to move mouse" bug).
      lastAdvanceTime.current = now;
      currentPanel.current = next;
      animate(progress, next / TRAVEL, {
        type: 'tween',
        duration: 0.65,
        ease: [0.16, 1, 0.3, 1], // ease-out-expo: snaps in fast, lands clean
      });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [progress]);

  // Mobile/touch: the card deck reflows into a clean, normal-scroll stack — no
  // sticky pin, no wheel hijack, no absolute layering. Each card fades + rises
  // in as it enters the viewport.
  if (isTouch) {
    return (
      <section className="relative bg-[#0e1110]">
        <div className="container space-y-6 py-20">
          {/* 01 — Services */}
          <MobileReveal className="overflow-hidden rounded-[1.25rem] border border-[#d8c5a6]/20 bg-[#2f3433] p-6 text-white ring-1 ring-inset ring-white/10 sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
              <span>01</span><span className="h-px w-8 bg-current" /><span>Services</span>
            </div>
            <p className="mb-2 text-[0.65rem] uppercase tracking-[0.34em] text-[#d8c5a6]">Photography &amp; Film</p>
            <h2 className="text-[clamp(2.05rem,9vw,2.8rem)] leading-[1.04] text-white">
              Coverage shaped around <span className="italic text-[#d0ac78]">the day.</span>
            </h2>
            <div className="my-4 flex items-center gap-3 text-[#d0ac78]/70">
              <span className="h-px w-10 bg-current" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span className="h-2.5 w-2.5 rotate-45 border border-current" />
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              <span className="h-px w-10 bg-current" />
            </div>
            <p className="max-w-md text-sm leading-6 text-white/60">
              Calm planning, gentle direction, and a documentary eye for the moments that need room to unfold.
            </p>
            <div className="mt-6 grid gap-3">
              {services.map(({ title, copy, Icon }, itemIndex) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl border border-[#d0ac78]/25 bg-[#303534] p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d0ac78]/35 bg-[#3a3933] text-[#d0ac78]">
                    <Icon size={18} strokeWidth={1.6} />
                  </span>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="font-serif text-xs tracking-[0.34em] text-[#d0ac78]">0{itemIndex + 1}</p>
                      <h3 className="text-xl leading-tight text-white">{title}</h3>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-white/60">{copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </MobileReveal>

          {/* 02 — Approach */}
          <MobileReveal className="overflow-hidden rounded-[1.25rem] border border-[#edf1ee]/20 bg-[#151817] text-white ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#0f1110]">
              {rawImageUrl && (
                <OptimizedImage
                  src={rawImageUrl}
                  alt="Wedding story"
                  width={900}
                  quality={78}
                  sizes="100vw"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,16,0.08),rgba(15,17,16,0.4))]" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
                <span>02</span><span className="h-px w-8 bg-current" /><span>Approach</span>
              </div>
              <Sparkles className="mb-4 text-accent" size={24} strokeWidth={1.5} />
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-accent">The Feel</p>
              <h2 className="text-[clamp(2rem,9vw,2.8rem)] leading-tight text-white">Natural, composed, never overworked.</h2>
              <p className="mt-4 text-sm leading-7 text-light/74">
                I look for images that feel effortless but still hold shape: clean light, honest movement, and portraits that do not pull you out of the moment.
              </p>
              <Link to="/gallery" className="btn btn-outline mt-6 w-fit gap-2 px-6 py-3 text-xs">
                View Work <ArrowRight size={16} />
              </Link>
            </div>
          </MobileReveal>

          {/* 03 — Notes */}
          <MobileReveal className="overflow-hidden rounded-[1.25rem] border border-[#171a1d]/10 bg-[#e4ded2] p-6 text-[#171a1d] ring-1 ring-inset ring-black/5 sm:p-8">
            <div className="mb-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-[#171a1d]/60">
              <span>03</span><span className="h-px w-8 bg-current" /><span>Notes</span>
            </div>
            <Quote size={30} strokeWidth={1.4} className="mb-4 text-[#8b7355]" />
            <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-[#171a1d]/55">Client Notes</p>
            <h2 className="text-[clamp(2rem,9vw,2.8rem)] leading-tight text-[#171a1d]">Remembered for feeling true.</h2>
            <div className="mt-6 grid gap-3">
              {reviews.map((review, reviewIndex) => (
                <figure key={review.name} className="relative aspect-[5/4] overflow-hidden rounded-lg ring-1 ring-black/10">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={reviewImageUrls[reviewIndex] ? { backgroundImage: `url("${optimizeImageUrl(reviewImageUrls[reviewIndex], { width: 800, quality: 70 })}")` } : { background: '#26211a' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5">
                    <blockquote className="font-serif text-[clamp(1.05rem,5vw,1.5rem)] leading-snug text-white">
                      "{review.quote}"
                    </blockquote>
                  </div>
                </figure>
              ))}
            </div>
          </MobileReveal>

          {/* 04 — Bookings */}
          <MobileReveal className="overflow-hidden rounded-[1.25rem] border border-[#d7d0c3]/25 bg-[#14171a] text-white ring-1 ring-inset ring-white/10">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#22262a]">
              {bookingImageUrl && (
                <OptimizedImage
                  src={bookingImageUrl}
                  alt="Wedding celebration"
                  width={900}
                  quality={78}
                  sizes="100vw"
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,23,26,0.06),rgba(20,23,26,0.46))]" />
            </div>
            <div className="p-6 sm:p-8">
              <div className="mb-6 flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
                <span>04</span><span className="h-px w-8 bg-current" /><span>Bookings</span>
              </div>
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-accent">Enquiries</p>
              <h2 className="text-[clamp(2rem,9vw,2.8rem)] leading-tight text-white">Tell me where the story begins.</h2>
              <p className="mt-4 text-sm leading-7 text-light/72">
                Share your date, city, and the kind of celebration you are planning. I will come back with availability, coverage options, and a simple next step.
              </p>
              <Link to="/contact" className="btn btn-primary mt-6 w-fit gap-2 px-6 py-3 text-xs">
                Start Enquiry <Mail size={17} />
              </Link>
            </div>
          </MobileReveal>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-[#0e1110]" style={{ height: `${(PANEL_COUNT + OUTRO) * 100}vh`, contain: 'paint style' }}>
      <div className="sticky top-0 h-screen overflow-hidden bg-[#0e1110] px-3 py-4 pt-20 sm:px-6 sm:py-6 sm:pt-24 md:px-10" style={{ willChange: 'transform' }}>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,169,110,0.04),transparent_42%,rgba(139,115,85,0.10)_100%)]" />

        <ServiceCard index={0} progress={progress} label="Services" className="border-[#d8c5a6]/20 bg-[#2f3433] text-white">
          <div className="grid h-full w-full grid-rows-[auto_minmax(0,1fr)] gap-4 overflow-hidden p-4 pt-14 text-center sm:p-6 sm:pt-16 lg:p-8 lg:pt-16">
            <div className="mx-auto max-w-5xl">
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.34em] text-[#d8c5a6] sm:mb-3 sm:text-xs">
                Photography & Film
              </p>
              <h2 className="text-[clamp(2.05rem,5.4vw,4.15rem)] leading-[1.02] text-white">
                Coverage shaped around <span className="italic text-[#d0ac78]">the day.</span>
              </h2>
              <div className="mx-auto my-3 flex items-center justify-center gap-3 text-[#d0ac78]/70 sm:my-4">
                <span className="h-px w-10 bg-current sm:w-20" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-2.5 w-2.5 rotate-45 border border-current" />
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                <span className="h-px w-10 bg-current sm:w-20" />
              </div>
              <p className="mx-auto max-w-3xl text-sm leading-6 text-white/60 sm:text-base sm:leading-7">
                Calm planning, gentle direction, and a documentary eye for the moments that need room to unfold.
              </p>
            </div>

            <div className="grid min-h-0 gap-3 sm:gap-4 md:grid-cols-3 lg:gap-5">
              {services.map(({ title, copy, Icon }, itemIndex) => (
                <div
                  key={title}
                  className="relative flex min-h-0 flex-col items-center justify-center rounded-2xl border border-[#d0ac78]/25 bg-[#303534] px-4 py-3 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:rounded-[1.4rem] sm:px-5 sm:py-5"
                >
                  <div className="mb-3 flex w-full items-center justify-between text-[#d0ac78]">
                    <p className="font-serif text-sm tracking-[0.34em]">0{itemIndex + 1}</p>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d0ac78]/35 bg-[#3a3933] sm:h-11 sm:w-11">
                      <Icon size={18} strokeWidth={1.6} />
                    </span>
                  </div>
                  <h3 className="text-xl leading-tight text-white sm:text-2xl lg:text-[1.7rem]">{title}</h3>
                  <span className="my-3 hidden h-px w-10 bg-[#d0ac78]/45 md:block" />
                  <p className="hidden max-w-sm text-sm leading-6 text-white/60 sm:text-[0.95rem] md:block">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </ServiceCard>

        <ServiceCard index={1} progress={progress} label="Approach" className="border-[#edf1ee]/20 bg-[#151817] text-white">
          <div className="grid h-full w-full grid-rows-[0.82fr_1fr] gap-3 p-5 pt-16 sm:gap-6 sm:p-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:grid-rows-1 lg:p-12 lg:pt-20">
            <div className="relative min-h-0 overflow-hidden rounded-lg bg-[#0f1110] lg:min-h-full">
              {rawImageUrl && (
                <OptimizedImage
                  src={rawImageUrl}
                  alt="Wedding story"
                  width={1300}
                  height={1100}
                  quality={78}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,17,16,0.08),rgba(15,17,16,0.36))]" />
            </div>
            <div className="flex min-h-0 flex-col justify-center rounded-lg border border-white/10 bg-[#202522] p-4 sm:p-8 lg:p-12">
              <Sparkles className="mb-3 text-accent sm:mb-6" size={24} strokeWidth={1.5} />
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-accent sm:mb-4 sm:text-xs">The Feel</p>
              <h2 className="text-[clamp(2rem,8vw,3.55rem)] leading-tight text-white md:text-6xl">Natural, composed, never overworked.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-light/74 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                I look for images that feel effortless but still hold shape: clean light, honest movement, and portraits that do not pull you out of the moment.
              </p>
              <Link to="/gallery" className="btn btn-outline mt-4 w-fit gap-2 px-5 py-3 text-xs sm:mt-8 sm:px-8 sm:text-sm">
                View Work <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </ServiceCard>

        <ServiceCard index={2} progress={progress} label="Notes" className="border-[#171a1d]/10 bg-[#e4ded2] text-[#171a1d]">
          <div className="grid h-full w-full grid-rows-[auto_1fr] gap-4 p-5 pt-16 sm:gap-6 sm:p-8 sm:pt-20 lg:grid-cols-[0.82fr_1.18fr] lg:grid-rows-1 lg:p-12 lg:pt-20">
            <div className="flex min-h-0 flex-col justify-between border-[#171a1d]/10 lg:border-r lg:pr-10">
              <Quote size={30} strokeWidth={1.4} className="mb-2 text-[#8b7355] sm:mb-0 sm:size-9" />
              <div>
                <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-[#171a1d]/55 sm:mb-4 sm:text-xs">Client Notes</p>
                <h2 className="text-[clamp(2rem,8vw,3.35rem)] leading-tight text-[#171a1d] md:text-5xl lg:text-6xl">Remembered for feeling true.</h2>
              </div>
            </div>

            <div className="grid min-h-0 grid-rows-1 gap-3 overflow-hidden sm:gap-4 md:grid-cols-2">
              {reviews.map((review, reviewIndex) => (
                <figure
                  key={review.name}
                  className={`group relative min-h-0 overflow-hidden rounded-lg ring-1 ring-black/10 ${reviewIndex === 1 ? 'hidden md:block' : 'block'}`}
                >
                  <div
                    className="absolute inset-0 scale-105 bg-cover bg-center blur-[3px] transition duration-500 group-hover:blur-0"
                    style={reviewImageUrls[reviewIndex] ? { backgroundImage: `url("${optimizeImageUrl(reviewImageUrls[reviewIndex], { width: 800, quality: 70 })}")` } : { background: '#26211a' }}
                  />
                  {/* Legibility gradient under the quote. */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/5" />
                  <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                    <blockquote className="font-serif text-[clamp(1.05rem,3vw,1.55rem)] leading-snug text-white">
                      "{review.quote}"
                    </blockquote>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </ServiceCard>

        <ServiceCard index={3} progress={progress} label="Bookings" className="border-[#d7d0c3]/25 bg-[#14171a] text-white">
          <div className="grid h-full w-full grid-rows-[0.82fr_1fr] gap-3 p-5 pt-16 sm:gap-6 sm:p-8 sm:pt-20 md:grid-cols-2 md:grid-rows-1 lg:p-12 lg:pt-20">
            <div className="relative min-h-0 overflow-hidden rounded-lg bg-[#22262a] ring-1 ring-white/10">
              {bookingImageUrl && (
                <OptimizedImage
                  src={bookingImageUrl}
                  alt="Wedding celebration"
                  width={1200}
                  height={900}
                  quality={78}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,23,26,0.06),rgba(20,23,26,0.44))]" />
            </div>

            <div className="flex min-h-0 flex-col justify-center rounded-lg border border-white/10 bg-[#101214] p-4 sm:p-8 lg:p-12">
              <p className="mb-2 text-[0.65rem] uppercase tracking-[0.28em] text-accent sm:mb-4 sm:text-xs">Enquiries</p>
              <h2 className="text-[clamp(2rem,8vw,3.35rem)] leading-tight text-white md:text-5xl lg:text-6xl">
                Tell me where the story begins.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-light/72 sm:mt-6 sm:text-base sm:leading-8 md:text-lg">
                Share your date, city, and the kind of celebration you are planning. I will come back with availability, coverage options, and a simple next step.
              </p>
              <Link to="/contact" className="btn btn-primary mt-4 w-fit gap-2 px-5 py-3 text-xs sm:mt-8 sm:gap-3 sm:px-8 sm:text-sm">
                Start Enquiry <Mail size={17} />
              </Link>
            </div>
          </div>
        </ServiceCard>
      </div>
    </section>
  );
};

export default HomeServices;
