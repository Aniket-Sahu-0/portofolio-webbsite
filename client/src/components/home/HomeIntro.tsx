import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, MotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import OptimizedImage from '../media/OptimizedImage';
import { loadMediaOrFallback, MediaItem } from '../../utils/media';

const panelData = [
  {
    eyebrow: '01 / Story',
    title: 'My Story, My Vision',
    description1:
      "I believe photography is more than taking pictures. It is a way of noticing the honest, unfussy moments that make a celebration feel personal.",
    description2:
      'My work is calm, observant, and story-led, blending quiet documentary frames with portraits that still feel like you.',
  },
  {
    eyebrow: '02 / Moments',
    title: 'The Unseen Moments',
    description1:
      'The soft glance before the ceremony, the hand squeeze, the room erupting after a toast: these are the frames that hold the real feeling of the day.',
    description2:
      'I move with the rhythm of the event, giving direction when it helps and disappearing when the moment needs space.',
  },
  {
    eyebrow: '03 / Together',
    title: "Let's Create Together",
    description1:
      'Every wedding has its own pace, color, and emotional weather. The goal is to make photographs that feel specific to your people and your place.',
    description2:
      'If that sounds like the kind of story you want preserved, we can shape the coverage around the day instead of forcing the day around the camera.',
  },
];

// Each panel "owns" a point on the 0..1 scroll progress. SEG is the gap between
// neighbouring panel centers; the fade windows below overlap their neighbours so
// adjacent panels cross-fade through the midpoint instead of flashing blank.
const SEG = 1 / (panelData.length - 1);
const fadeIn = (i: number) => i * SEG - 0.6 * SEG;
const plateauIn = (i: number) => i * SEG - 0.4 * SEG;
const plateauOut = (i: number) => i * SEG + 0.4 * SEG;
const fadeOut = (i: number) => i * SEG + 0.6 * SEG;

type Panel = (typeof panelData)[number] & { images: (MediaItem | undefined)[] };

const IntroImages: React.FC<{ progress: MotionValue<number>; index: number; images: (MediaItem | undefined)[] }> = ({
  progress,
  index,
  images,
}) => {
  const c = index * SEG;
  const opacity = useTransform(progress, [fadeIn(index), plateauIn(index), plateauOut(index), fadeOut(index)], [0, 1, 1, 0]);
  const y = useTransform(progress, [fadeIn(index), c, fadeOut(index)], [26, 0, -18]);
  const scale = useTransform(progress, [fadeIn(index), c, fadeOut(index)], [1.03, 1, 0.99]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{ opacity, y, scale, willChange: 'transform, opacity' }}
    >
      <div className="absolute left-0 top-0 h-[74%] w-[68%] overflow-hidden rounded-md bg-primary">
        {images[0] && (
          <OptimizedImage
            src={images[0].url}
            alt={images[0].alt || 'Wedding moment'}
            width={900}
            quality={76}
            sizes="(min-width: 768px) 34vw, 60vw"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="absolute bottom-0 right-0 h-[74%] w-[68%] overflow-hidden rounded-md bg-primary ring-1 ring-primary">
        {images[1] && (
          <OptimizedImage
            src={images[1].url}
            alt={images[1].alt || 'Wedding moment'}
            width={900}
            quality={76}
            sizes="(min-width: 768px) 34vw, 60vw"
            className="h-full w-full object-cover"
          />
        )}
      </div>
    </motion.div>
  );
};

const IntroText: React.FC<{ progress: MotionValue<number>; index: number; panel: Panel }> = ({ progress, index, panel }) => {
  const c = index * SEG;
  const opacity = useTransform(progress, [fadeIn(index), plateauIn(index), plateauOut(index), fadeOut(index)], [0, 1, 1, 0]);
  const y = useTransform(progress, [fadeIn(index), c, fadeOut(index)], [30, 0, -22]);
  // Only the panel that's essentially on-screen should be interactive.
  const pointerEvents = useTransform(progress, (p) => (Math.abs(p - c) < 0.32 * SEG ? 'auto' : 'none'));

  return (
    <motion.div className="col-start-1 row-start-1" style={{ opacity, y, pointerEvents }}>
      <p className="mb-4 text-xs uppercase tracking-[0.32em] text-accent">{panel.eyebrow}</p>
      <h2 className="text-4xl md:text-5xl lg:text-6xl">{panel.title}</h2>
      <p className="mt-6 text-base leading-8 text-light/78 md:text-lg">{panel.description1}</p>
      <p className="mt-4 text-base leading-8 text-muted md:text-lg">{panel.description2}</p>
      <Link to="/about" className="btn btn-ghost mt-8 w-fit gap-3">
        About The Artist <ArrowRight size={17} />
      </Link>
    </motion.div>
  );
};

const Dot: React.FC<{ progress: MotionValue<number>; index: number }> = ({ progress, index }) => {
  const c = index * SEG;
  const width = useTransform(progress, [c - 0.5 * SEG, c - 0.25 * SEG, c + 0.25 * SEG, c + 0.5 * SEG], [16, 40, 40, 16]);
  const opacity = useTransform(progress, [c - 0.5 * SEG, c - 0.25 * SEG, c + 0.25 * SEG, c + 0.5 * SEG], [0.3, 1, 1, 0.3]);
  return <motion.span className="h-1.5 rounded-full bg-accent" style={{ width, opacity }} />;
};

const HomeIntro: React.FC = () => {
  const [images, setImages] = useState<MediaItem[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // Native scroll drives everything — no wheel hijacking. The spring smooths the
  // raw (and on trackpads, very granular) scroll stream into a silky scrub. Tuned
  // tighter (higher stiffness, quicker settle) so it tracks the finger instead of
  // drifting/floating behind it.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 22, restDelta: 0.001 });

  const panels = useMemo<Panel[]>(
    () => panelData.map((panel, index) => ({ ...panel, images: [images[index * 2], images[index * 2 + 1]] })),
    [images]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadMediaOrFallback('aboutTeaser', { limit: 6, signal: controller.signal }).then(setImages);
    return () => controller.abort();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-primary" style={{ height: `${panelData.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute inset-0 bg-accent/5" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(70% 70% at 50% 20%, rgba(139,115,85,0.12), transparent 68%)' }}
        />
        <div className="pointer-events-none absolute left-4 top-20 hidden text-xs uppercase tracking-[0.26em] text-white/35 md:block lg:left-8">
          Scroll Scene
        </div>

        <div className="container relative z-10 grid h-full items-center gap-6 py-20 md:grid-cols-[1fr_0.9fr] md:gap-12 lg:gap-16">
          <div className="relative mx-auto h-[34vh] w-full max-w-[560px] sm:h-[42vh] md:h-[68vh] md:max-w-none">
            {panels.map((panel, index) => (
              <IntroImages key={index} progress={progress} index={index} images={panel.images} />
            ))}
          </div>

          <div className="relative mx-auto max-w-xl md:mx-0">
            {/* Grid-stacking keeps every panel in one cell so the column sizes to the
                tallest panel and the dots below never jump as panels cross-fade. */}
            <div className="grid">
              {panels.map((panel, index) => (
                <IntroText key={index} progress={progress} index={index} panel={panel} />
              ))}
            </div>

            <div className="mt-8 flex gap-2">
              {panels.map((_, index) => (
                <Dot key={index} progress={progress} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntro;
