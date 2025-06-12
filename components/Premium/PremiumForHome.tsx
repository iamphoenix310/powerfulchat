'use client';

import { useEffect, useState } from 'react';
import { client } from '@/app/utils/sanityClient';
import PremiumGrid from './PremiumGrid';
import Link from 'next/link';
import type { PremiumItem } from './PremiumContent';

export default function HomepagePremiumSection() {
  const [items, setItems] = useState<PremiumItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestPremiumImages = async () => {
      setLoading(true);
      const result = await client.fetch(
        `*[_type == "images" && isPremium == true] | order(_createdAt desc)[0...6] {
          _id, title, slug, image, price, isPremium,
          "category": category->{_id, title},
          tags, "creator": creator->{username}
        }`
      );
      setItems(result);
      setLoading(false);
    };

    fetchLatestPremiumImages();
  }, []);

  return (
    <div className="space-y-6 w-full px-4 sm:px-6 lg:px-12 xl:px-20 2xl:px-28 py-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800">
        🏆 Premium Content
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : (
        <PremiumGrid items={items} />
      )}

      <div className="flex justify-center">
        <Link
          href="/premium"
          className="mt-6 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-black transition"
        >
          Explore More Premium Content
        </Link>
      </div>
    </div>
  );
}
