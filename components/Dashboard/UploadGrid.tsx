'use client';

import React from 'react';
import ImageCard from '@/components/ImageDetails/imageCard';
import { ImageData } from '@/types/image';

const DashboardUploads: React.FC<{ images: ImageData[] }> = ({ images }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Your Uploads</h3>
      {images.length === 0 ? (
        <p className="text-gray-500">You have not uploaded anything yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <ImageCard key={img._id} image={img} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardUploads;
