"use client"
// SimilarWallpapers.tsx
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client, urlFor } from '@/app/utils/sanityClient';

interface SimilarWallpaper {
  title: string;
  slug: {
    current: string;
  };
  image: {
    asset: {
      _ref: string;
    };
  };
}

interface SimilarWallpapersProps {
  category: string;
  categorySlug: string;
}

const SimilarWallpapers: React.FC<SimilarWallpapersProps> = ({ category, categorySlug }) => {
  const [similarWallpapers, setSimilarWallpapers] = useState<SimilarWallpaper[]>([]);

  useEffect(() => {
    const fetchSimilarWallpapers = async () => {
      try {
        const response = await client.fetch(
          // decending order
          `*[_type == "wallpaper" && references($category)] | order(_createdAt desc) [0...3] {
            title,
            slug,
            image
          }`,
          { category }
        );

        if (response) {
          setSimilarWallpapers(response);
        }
      } catch (error) {
        console.error('Error fetching similar wallpapers', error);
      }
    };

    fetchSimilarWallpapers();
  }, [category]);

  return (
    <div className="my-4">
      <h2 className="text-xl font-semibold mb-3">Similar Wallpapers</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {similarWallpapers.map((wallpaper, index) => (
          <div key={index} className="card">
            <Link href={`/wallpapers/${categorySlug}/${wallpaper.slug.current}`}>
              <span>
                <Image src={urlFor(wallpaper.image)} alt={wallpaper.title} width={300} height={200} />
                <p className='text-lg mt-2'>{wallpaper.title}</p>
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimilarWallpapers;
