'use client';

import React, { useState, DragEvent } from 'react';
import { useSession } from 'next-auth/react';
import { client } from '@/app/utils/sanityClient';
import { toast } from 'react-toastify';
import Image from 'next/image';

const UploadDropZone = () => {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    if (!session?.user?.email) return toast.error('Login to upload');

    try {
      setUploading(true);
      setPreview(URL.createObjectURL(file));

      // Upload to Sanity
      const asset = await client.assets.upload('image', file);

      // Fetch creator ID
      const creator = await client.fetch(`*[_type == "user" && email == $email][0]{_id}`, {
        email: session.user.email,
      });

      // Create image doc
      const newDoc = {
        _type: 'images',
        title: file.name.split('.')[0],
        description: '',
        image: { asset: { _ref: asset._id, _type: 'reference' } },
        creator: { _ref: creator._id, _type: 'reference' },
        views: 0,
        likes: 0,
        tags: [],
        alt: file.name,
        slug: {
          _type: 'slug',
          current: file.name.toLowerCase().replace(/\s+/g, '-').replace(/\.[^/.]+$/, ''),
        },
      };

      await client.create(newDoc);
      toast.success('Image uploaded!');
    } catch (err) {
      console.error(err);
      toast.error('Upload failed. Try again.');
    } finally {
      setUploading(false);
      setPreview(null);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-blue-400 p-6 rounded-md text-center bg-blue-50 hover:bg-blue-100 transition-colors"
    >
      <p className="text-lg font-semibold mb-2">Drag & Drop your image here</p>
      <p className="text-sm text-gray-600 mb-4">or click below to select from device</p>
      <input
        type="file"
        accept="image/*"
        onChange={handleSelect}
        className="hidden"
        id="upload"
      />
      <label
        htmlFor="upload"
        className="cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
      >
        Select Image
      </label>

      {uploading && <p className="text-blue-600 mt-4">Uploading...</p>}

      {preview && (
        <div className="mt-4">
          <Image src={preview} alt="Preview" className="w-48 rounded shadow-md mx-auto" />
        </div>
      )}
    </div>
  );
};

export default UploadDropZone;
