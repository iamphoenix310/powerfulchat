'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export default function AvatarWithFallback({ src, alt, width, height, className }: Props) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setImgSrc('/default-avatar.png')}
    />
  );
}
