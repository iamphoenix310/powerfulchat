// app/images/[image]/page.tsx
import React from 'react';
import type { Metadata, ResolvingMetadata } from 'next';
import { client, urlFor } from '@/app/utils/sanityClient';

import ImageDetailComponent from '@/components/ImageDetails/imageDetails'; // Update the import path as necessary

const ImageDetailPage: React.FC<{ params: { image: string } }> = ({ params }) => {
  const { image } = params; 

  // Render the page content using imageDetail
  return (
    <ImageDetailComponent imageSlug={params.image} />
  );
};

export async function generateMetadata({ params }: { params: { image: string } }): Promise<Metadata> {
  const imageSlug = params.image;
  const getMimeTypeFromUrl = (url: string): string => {
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
    if (url.endsWith('.webp')) return 'image/webp';
    return 'image/*'; // fallback
  };
  
try {
  // Directly fetch the image details here
  const query = `*[_type == "images" && slug.current == $image][0]`;
  const imageDetail = await client.fetch(query, { image: imageSlug });

  if (!imageDetail) {
    return { title: "Image not found" }; // Or some other default metadata
  }

  return {
    title: imageDetail.title,
    description: imageDetail.description,
    keywords: imageDetail.tags?.join(', '),
    alternates: {
      canonical: `https://visitpowerful.com/images/${imageDetail.slug.current}`,
    },
    openGraph: {
      images: [
        { url: urlFor(imageDetail.image),
          width: 800,
          height: 1200,
          type: getMimeTypeFromUrl(urlFor(imageDetail.image)), 
          alt: imageDetail.alt || 'Image from Powerful',
        }//  // Assuming urlFor returns the correct URL
      ],
      title: imageDetail.title,
      description: imageDetail.description,
      url: `https://visitpowerful.com/images/${imageDetail.slug.current}`,
      siteName: 'Powerful',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: imageDetail.title,
      description: imageDetail.description,
      siteId: '1467726470533754880',
      creator: '@powerfulcreat',
      images: [{url: urlFor(imageDetail.image), width: 500, height: 889,}], // Must be an absolute URL
    },
    // ✅ JSON-LD here
    other: {
      'application/ld+json': JSON.stringify({
        "@context": "https://schema.org",
        "@type": "ImageObject",
        contentUrl: urlFor(imageDetail.image),
        name: imageDetail.title,
        description: imageDetail.description,
        uploadDate: imageDetail._createdAt,
        creditText: "Uploaded by Powerful user",
      }),
    },
    // Other metadata fields...
  };
} catch (err) {
  console.error(err);
  return { title: "Image not found" }; // Or some other default metadata
}
}

export default ImageDetailPage;
