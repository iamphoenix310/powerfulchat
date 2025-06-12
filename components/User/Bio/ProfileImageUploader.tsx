'use client';

import { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { client } from '@/app/utils/sanityClient';
import { toast } from 'react-hot-toast';
import { ImagePlus, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function ProfileImageUploader({ userId, currentImage }: { userId: string; currentImage?: string }) {
  const { data: session } = useSession();
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!session || session.user.id !== userId) return null;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const asset = await client.assets.upload('image', file);
      await client.patch(userId).set({ profileImage: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } }).commit();
      setPreview(URL.createObjectURL(file));
      toast.success('Profile image updated');
    } catch (err) {
      console.error('Upload failed', err);
      toast.error('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative w-28 h-28 rounded-full overflow-hidden border border-gray-300 shadow-sm group cursor-pointer"
      onClick={() => inputRef.current?.click()}
    >
      {uploading ? (
        <div className="flex items-center justify-center h-full bg-white">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : (
        <>
          <Image
            src={preview || '/default-avatar.png'}
            alt="Profile"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
            <ImagePlus className="w-6 h-6" />
          </div>
        </>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFile(e.target.files[0]);
        }}
        className="hidden"
      />
    </div>
  );
}
