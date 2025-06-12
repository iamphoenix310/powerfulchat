'use client';

import { useState, useEffect } from 'react';
import { client } from '@/app/utils/sanityClient';
import SearchBar from './SearchBar';
import PremiumGrid from './PremiumGrid';
import LoadingSpinner from './LoadingSpinner';

export type PremiumItem = {
  _id: string;
  title: string;
  slug: { current: string };
  image: any;
  price?: number;
  isPremium: boolean;
  category?: {
    _id: string;
    title: string;
  };
  tags?: string[];
  creator?: {
    username: string;
  };
};

const ITEMS_PER_PAGE = 12;

export default function PremiumContent() {
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchImages = async (reset = false) => {
    setLoading(true);

    const query = searchQuery
      ? `*[_type == "images" && isPremium == true && (
          title match $term || 
          description match $term || 
          tags[] match $term
        )] | order(_createdAt desc) [$start...$end] {
          _id, title, slug, image, price, isPremium,
          "category": category->{_id, title},
          tags, "creator": creator->{username}
        }`
      : `*[_type == "images" && isPremium == true] | order(_createdAt desc) [$start...$end] {
          _id, title, slug, image, price, isPremium,
          "category": category->{_id, title},
          tags, "creator": creator->{username}
        }`;

    const result = await client.fetch(query, {
      term: `${searchQuery}*`,
      start: reset ? 0 : page * ITEMS_PER_PAGE,
      end: reset ? ITEMS_PER_PAGE : (page + 1) * ITEMS_PER_PAGE,
    });

    if (reset) {
      setItems(result);
      setPage(0);
    } else {
      setItems(prev => [...prev, ...result]);
    }

    setHasMore(result.length === ITEMS_PER_PAGE);
    setLoading(false);
  };

  useEffect(() => {
    setPage(0);
    fetchImages(true);
  }, [searchQuery]);

  useEffect(() => {
    if (page > 0) fetchImages();
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
        !loading &&
        hasMore
      ) {
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  return (
    <div className="space-y-8 w-full">
      <div className="bg-white rounded-xl shadow-md p-6 mx-2 sm:mx-4 lg:mx-8 xl:mx-16 2xl:mx-24">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-2xl">
            <SearchBar onSearch={(q) => setSearchQuery(q)} />
          </div>
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 lg:px-8 xl:px-16 2xl:px-24">
        <PremiumGrid items={items} />
      </div>

      {loading && (
        <div className="text-center py-6 text-gray-500">Loading more...</div>
      )}

      {!loading && !hasMore && items.length > 0 && (
        <div className="text-center py-8 text-gray-500">You’ve reached the end of the content</div>
      )}
    </div>
  );
}
