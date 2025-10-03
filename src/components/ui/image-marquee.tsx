'use client';

import Image from 'next/image';
import { memo } from 'react';
import { cn } from '@/lib/utils';

type ImageMarqueeProps = {
  images: string[];
  className?: string;
};

export const ImageMarquee = memo(({ images, className }: ImageMarqueeProps) => {
  return (
    <div className={cn("relative flex w-full overflow-hidden", className)}>
      <div className="flex animate-marquee whitespace-nowrap">
        {images.map((src, index) => (
          <div key={`marquee-1-${index}`} className="flex-shrink-0 w-36 h-36 mx-1">
            <Image
              src={src}
              alt={`Marquee image ${index + 1}`}
              width={144}
              height={144}
              className="w-full h-full object-cover rounded-md border-2 border-primary/50"
            />
          </div>
        ))}
      </div>
      <div className="absolute top-0 flex animate-marquee2 whitespace-nowrap">
        {images.map((src, index) => (
          <div key={`marquee-2-${index}`} className="flex-shrink-0 w-36 h-36 mx-1">
            <Image
              src={src}
              alt={`Marquee image ${index + 1}`}
              width={144}
              height={144}
              className="w-full h-full object-cover rounded-md border-2 border-primary/50"
            />
          </div>
        ))}
      </div>
    </div>
  );
});

ImageMarquee.displayName = 'ImageMarquee';
