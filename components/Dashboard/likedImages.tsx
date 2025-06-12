'use client'
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/app/utils/sanityClient';

interface LikedImage {
    slug: any;
    imageUrl(imageUrl: any): string | import("next/dist/shared/lib/get-img-props").StaticImport;
    _id: string;
    url: string;
    title: string; // Add this line
}

const LikedImages = () => {
    const { data: session, status } = useSession();
    const [likedImages, setLikedImages] = useState<LikedImage[]>([]); // Add type annotation

    useEffect(() => {
        const fetchLikedImages = async () => {
            if (status === 'authenticated' && session?.user?.email) {
                try {
                    const response = await fetch(`/api/likedDowns/getLikedImages?email=${session.user.email}`);
                    if (!response.ok) {
                        throw new Error(`Error: ${response.status}`);
                    }
                    const data = await response.json();
                    setLikedImages(data.likedImages);
                } catch (error) {
                    console.error('Error fetching liked images:', error);
                }
            }
        };

        fetchLikedImages();
    }, [session, status]);

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'unauthenticated') {
        return <p>You need to be logged in to see this.</p>;
    }
    return (
        <div className="bg-white shadow-md p-4 rounded-lg">
    <h2 className="text-2xl font-semibold mb-4">Your Liked Images</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {likedImages.length === 0 && (
            <p className="text-gray-500">You have not liked any images yet.</p>
        )}
        {likedImages.map((image) => (
           
            <div key={image._id} className="relative">
                 <Link href={`/images/${image.slug.current}`}>
                <Image
                    src={urlFor(image.imageUrl)}
                    width={200}
                    height={200}
                    alt={image.title}
                    layout="responsive"
                    className="rounded-lg"
                />
                </Link>
                {/* <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button className="text-white bg-red-500 px-3 py-1 rounded-lg hover:bg-red-600">
                        Unlike
                    </button>
                </div> */}
            </div>
        ))}
    </div>
</div>
    );
};

export default LikedImages;
