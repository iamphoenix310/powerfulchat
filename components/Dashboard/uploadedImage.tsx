'use client';

import React, { useEffect, useState } from 'react';
import { client, urlFor } from '@/app/utils/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import { TrashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

interface Props {
  userEmail: string;
}

interface UploadedImage {
  _id: string;
  title: string;
  slug: { current: string };
  image: any;
  likes: number;
  views: number;
  alt?: string;
  creator?: {
    _ref: string;
  };
}

const UploadedImages: React.FC<Props> = ({ userEmail }) => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserImages = async () => {
      const userQuery = `*[_type == "user" && email == $email][0]{ _id }`;
      const user = await client.fetch(userQuery, { email: userEmail });

      if (user?._id) {
        setUserId(user._id);
        const imageQuery = `*[_type == "images" && creator._ref == $userId] | order(_updatedAt desc)[0...100]{
          _id, title, slug, image, alt, likes, views, creator
        }`;
        const userImages = await client.fetch(imageQuery, { userId: user._id });
        setImages(userImages);
      }
      setLoading(false);
    };

    fetchUserImages();
  }, [userEmail]);

  const getAllReferencesToImage = async (imageId: string) => {
    return await client.fetch(
      `*[_references($imageId)]{ _id, _type }`,
      { imageId }
    );
  };
  
  const handleDelete = async (imageId: string) => {
    try {
      setDeletingId(imageId);
  
      const references = await getAllReferencesToImage(imageId);
  
      const patchOrDelete = references.map((ref: { _type: string; _id: string; }) => {
        if (ref._type === 'like' || ref._type === 'download') {
          return client.delete(ref._id); // just delete the doc
        } else {
          // Attempt to remove reference to image field if it's a generic document
          return client.patch(ref._id).unset(['image']).commit();
        }
      });
  
      await Promise.all(patchOrDelete);
  
      // Wait a short delay to ensure Sanity has committed mutations
      await new Promise((res) => setTimeout(res, 300));
  
      await client.delete(imageId);
  
      setImages((prev) => prev.filter((img) => img._id !== imageId));
      toast.success('✅ Image deleted successfully');
    } catch (err) {
      console.error('Delete failed', err);
      toast.error('❌ Failed to delete image. It is still referenced somewhere.');
    } finally {
      setDeletingId(null);
    }
  };

  

  if (loading) return <p className="text-gray-500">Loading your uploads...</p>;

  if (images.length === 0)
    return <p className="text-gray-500">You haven’t uploaded any images yet.</p>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">📸 Your Uploaded Images</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div
            key={img._id}
            className="relative bg-white border rounded shadow hover:shadow-lg overflow-hidden group"
          >
            <Link href={`/images/${img.slug.current}`}>
              <Image
                src={urlFor(img.image)}
                alt={img.alt || img.title}
                width={500}
                height={300}
                className="object-cover w-full h-48"
              />
            </Link>

            <div className="p-2">
              <h4 className="text-sm font-semibold truncate">{img.title}</h4>
              <div className="text-xs text-gray-500 mt-1 flex justify-between">
                <span>❤️ {img.likes}</span>
                <span>👁️ {img.views}</span>
              </div>
            </div>

            <button
              onClick={() => handleDelete(img._id)}
              disabled={deletingId === img._id}
              className="absolute top-2 right-2 bg-white p-1 rounded-full hover:bg-red-100 z-10"
              title="Delete"
            >
              <TrashIcon className="w-5 h-5 text-red-500" aria-hidden="true" />


            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedImages;
