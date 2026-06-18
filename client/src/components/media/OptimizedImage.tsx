import React from 'react';
import { optimizeImageUrl } from '../../utils/imageOptimizer';

type OptimizedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> & {
  src: string;
  alt: string;
  width?: number;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  responsiveWidths?: number[];
};

const defaultWidths = [480, 720, 960, 1200, 1600, 1920];

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  quality = 78,
  sizes = '100vw',
  loading,
  decoding = 'async',
  priority = false,
  responsiveWidths = defaultWidths,
  className,
  ...props
}) => {
  const usableWidths = responsiveWidths.filter((candidate) => !width || candidate <= Math.max(width, 480));
  const finalWidths = usableWidths.length ? usableWidths : [width || 1200];
  const optimizedSrc = optimizeImageUrl(src, { width: width || finalWidths[finalWidths.length - 1], quality, format: 'webp' });
  const srcSet = finalWidths
    .map((candidate) => `${optimizeImageUrl(src, { width: candidate, quality, format: 'webp' })} ${candidate}w`)
    .join(', ');

  return (
    <img
      src={optimizedSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : loading || 'lazy'}
      decoding={decoding}
      // lowercase attribute name avoids React's unknown-prop warning on fetchPriority
      {...{ fetchpriority: priority ? 'high' : 'auto' }}
      className={className}
      {...props}
    />
  );
};

export default OptimizedImage;
