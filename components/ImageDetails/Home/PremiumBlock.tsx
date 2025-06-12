'use client';

import React from 'react';

import Link from 'next/link';
import PremiumContent from '@/components/Premium/PremiumContent';

const PremiumImagesGrid = () => {
 
  return (
    <>
 <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center mb-2"><Link href="/premium">Premium Content</Link></h1>
      <p className="text-center text-gray-600 mb-8">Discover our exclusive high-quality premium content</p>
      <PremiumContent />
    </div>
    </>
  );
};

export default PremiumImagesGrid;
