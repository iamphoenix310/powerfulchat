'use client';

import React from 'react';

const ImageGridSkeleton: React.FC<{ count?: number }> = ({ count = 12 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full h-64 aspect-[3/4] bg-gray-200 animate-pulse rounded-md"
        />
      ))}
    </div>
  );
};

export default ImageGridSkeleton;
