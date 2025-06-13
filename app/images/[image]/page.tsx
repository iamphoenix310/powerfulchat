import { client, urlFor } from '@/app/utils/sanityClient';
import ImageDetailComponent from '@/components/ImageDetails/imageDetails';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
  params: Promise<{ image: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { image } = await params;
  const getMimeTypeFromUrl = (url: string): string => {
    if (url.endsWith('.png')) return 'image/png';
    if (url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
    if (url.endsWith('.webp')) return 'image/webp';
    return 'image/*';
  };

  try {
    const query = `*[_type == "images" && slug.current == $image][0]`;
    const imageDetail = await client.fetch(query, { image });

    if (!imageDetail) {
      return { title: "Image not found" };
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
          {
            url: urlFor(imageDetail.image),
            width: 800,
            height: 1200,
            type: getMimeTypeFromUrl(urlFor(imageDetail.image)),
            alt: imageDetail.alt || 'Image from Powerful',
          },
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
        images: [{ url: urlFor(imageDetail.image), width: 500, height: 889 }],
      },
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
    };
  } catch (err) {
    console.error(err);
    return { title: "Image not found" };
  }
}

export default async function ImageDetailPage({ params }: Props) {
  const { image } = await params;

  return (
    <ImageDetailComponent imageSlug={image} />
  );
}