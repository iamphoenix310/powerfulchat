'use client';

import { urlFor } from '@/utils/sanityClient';
import { Audiowide } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

interface ImageCardProps {
  image: {
    _id: string;
    slug: { current: string };
    image: any;
    title: string;
    alt?: string;
    price?: number;
    isPremium?: boolean;
    creator?: {
      username: string;
    };
  };
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const isPremium = image.isPremium === true;
  const uploader = image.creator?.username;

  return (
    <Link
      href={`/images/${image.slug.current}`}
      className="block rounded overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
    >
      <div className="relative group">
        {/* Main Image */}
        <Image
          src={urlFor(image.image, { width: 400, height: 600 })}
          alt={image.alt || image.title || 'Image'}
          width={400}
          height={600}
          loading="lazy"
          draggable={false}
          className="w-full h-auto rounded-lg object-cover object-center"
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* ✅ Center Copyright Layer */}
        {/* <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 pointer-events-none">
          <span className={`text-white text-xl md:text-2xl lg:text-2xl font-bold opacity-20 select-none ${audiowide.className}`}>
            © Powerful
          </span>
        </div> */}

        {/* Price or Free badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
            isPremium 
              ? 'bg-emerald-600 text-white dark:bg-emerald-700' 
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}>
            {isPremium && image.price ? `₹${image.price}` : 'Free'}
          </span>
        </div>

        {/* Uploader Info */}
        {/* {uploader && (
          <div className="absolute bottom-2 left-2 z-10">
            <div className="px-2 py-1 text-xs text-white bg-black/50 backdrop-blur-sm rounded-md inline-block">
              by{' '}
              <Link
                href={`/${uploader}`}
                className="text-emerald-300 hover:underline"
              >
                {uploader}
              </Link>
            </div>
          </div>
        )} */}

      </div>
    </Link>
  );
};

export default ImageCard;
