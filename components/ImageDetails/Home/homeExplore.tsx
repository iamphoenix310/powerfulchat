'use client';

import ImageCard from '@/components/ImageDetails/imageCard';
import SearchBar from '@/components/Search/searchBar';
import { client } from '@/utils/sanityClient';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ImageGridSkeleton from '../Loader/ImageGridSkeleton';

interface ImageData {
  _id: string;
  title: string;
  slug: { current: string };
  image: any;
  alt?: string;
  description: string;
  tags: string[];
  price?: number;
  isPremium?: boolean;
  creator?: {
    username: string;
  };
}

const HomeExplore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImages = async () => {
    setLoading(true);

    const query = searchTerm
      ? `*[_type == "images" && (
            title match $term || 
            description match $term || 
            tags[] match $term
          )] | order(_updatedAt desc)[0...12] {
            _id, title, slug, image, alt, description, tags, price, isPremium,
            "creator": creator->{username}
          }`
      : `*[_type == "images"] | order(_updatedAt desc)[0...12] {
            _id, title, slug, image, alt, description, tags, price, isPremium,
            "creator": creator->{username}
          }`;

    const result = await client.fetch(query, {
      term: `${searchTerm}*`,
    });

    setImages(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, [searchTerm]);

  return (
    <div className="pt-4 pb-10 px-4 mx-auto w-[99%] sm:w-[90%] lg:w-[80%]">
      {/* Search */}
      <div className="mb-6">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />
      </div>

      {/* Images or Loading */}
      {loading ? (
        <ImageGridSkeleton />
      ) : images.length === 0 ? (
        <p className="text-center text-gray-500">No images found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <ImageCard key={image._id} image={image} />
          ))}
        </div>
      )}

      {/* Explore More */}
      <div className="mt-8 text-center">
        <Link href="/images">
          <button className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md text-sm">
            Explore More
          </button>
        </Link>
      </div>
    </div>
  );
};

export default HomeExplore;
