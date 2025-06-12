'use client';

import ImageCard from '@/components/ImageDetails/imageCard';
import SearchBar from '@/components/Search/searchBar';
import { client } from '@/utils/sanityClient';
import { useEffect, useState } from 'react';

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

const Images = () => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchImages = async (reset = false) => {
    setLoading(true);

    const query = searchTerm
      ? `*[_type == "images" && (
          title match $term || 
          description match $term || 
          tags[] match $term
        )] | order(_updatedAt desc) [$start...$end] {
          _id, title, slug, image, alt, description, tags, price, isPremium,
          "creator": creator->{username}
        }`
      : `*[_type == "images"] | order(_updatedAt desc) [$start...$end] {
          _id, title, slug, image, alt, description, tags, price, isPremium,
          "creator": creator->{username}
        }`;

    const result = await client.fetch(query, {
      term: `${searchTerm}*`,
      start: reset ? 0 : page * 12,
      end: reset ? 12 : (page + 1) * 12,
    });

    setImages(prev => (reset ? result : [...prev, ...result]));
    setLoading(false);
  };

  useEffect(() => {
    fetchImages(true);
    setPage(0);
  }, [searchTerm]);

  useEffect(() => {
    if (page > 0) fetchImages();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  return (
    <div className="relative">
      {/* Sticky Search */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-lg mx-auto p-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 p-4">
        {images.map(image => (
          <ImageCard key={image._id} image={image} />
        ))}
      </div>

      {/* Loader */}
      {loading && (
        <div className="text-center py-6 text-gray-500">Loading more...</div>
      )}
    </div>
  );
};

export default Images;
