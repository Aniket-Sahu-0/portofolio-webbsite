import React, { useEffect, useMemo, useState } from 'react';
import OptimizedImage from '../media/OptimizedImage';
import { loadFolderImages, MediaItem } from '../../utils/media';

// Cap on how many images the marquee renders. The strip duplicates each row for a
// seamless loop, so the actual <img> count is roughly double this — keep it modest.
const MAX_STRIP_IMAGES = 20;

const css = `
@keyframes home-marquee-left {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
@keyframes home-marquee-right {
  0% { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}
.home-marquee-left {
  animation: home-marquee-left 46s linear infinite;
}
.home-marquee-right {
  animation: home-marquee-right 46s linear infinite;
}
.home-marquee-track {
  display: flex;
  width: max-content;
  will-change: transform;
}
@media (prefers-reduced-motion: reduce) {
  .home-marquee-left,
  .home-marquee-right {
    animation: none;
  }
}
`;

const widthClasses = [
  'h-[260px] md:h-[340px]',
  'h-[300px] md:h-[380px]',
  'h-[240px] md:h-[320px]',
  'h-[280px] md:h-[360px]',
  'h-[260px] md:h-[340px]',
];

const HomeGalleryStrip: React.FC = () => {
  const [images, setImages] = useState<MediaItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    // Pull portraits from media/home/portfolio_slideshow/portraits (capped for perf).
    loadFolderImages('home/portfolio_slideshow/portraits', {
      limit: MAX_STRIP_IMAGES,
      signal: controller.signal,
    }).then(setImages);
    return () => controller.abort();
  }, []);

  const rows = useMemo(() => {
    const midpoint = Math.ceil(images.length / 2);
    const first = images.slice(0, midpoint);
    const second = images.slice(midpoint);
    return [first.length ? first : images, second.length ? second : images];
  }, [images]);

  return (
    <section id="gallery-marquee" className="relative w-full overflow-hidden bg-secondary py-12 md:py-16">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="flex flex-col gap-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] md:gap-6">
        {rows.map((row, rowIndex) => {
          const loop = [...row, ...row];
          return (
            <div
              key={rowIndex}
              className={`home-marquee-track ${rowIndex === 0 ? 'home-marquee-left' : 'home-marquee-right'}`}
            >
              {loop.map((image, imageIndex) => (
                <div
                  key={`${rowIndex}-${image.id || image.url}-${imageIndex}`}
                  className={`mx-2 flex-none overflow-hidden rounded-md bg-primary md:mx-3 ${
                    widthClasses[imageIndex % widthClasses.length]
                  }`}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={image.alt || 'Wedding gallery photograph'}
                    width={700}
                    height={933}
                    quality={72}
                    sizes="(min-width: 768px) 360px, 280px"
                    className="h-full w-auto max-w-none opacity-90"
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-secondary to-transparent md:w-32" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-secondary to-transparent md:w-32" />
    </section>
  );
};

export default HomeGalleryStrip;
