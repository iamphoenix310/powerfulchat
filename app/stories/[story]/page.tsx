import React from 'react';
import type { Metadata } from 'next';
import { client, urlFor } from '@/app/utils/sanityClient';
import StoryPage from '@/components/Stories/storiesPage'; // Update the import path as necessary

interface StoryDetailProps {
  params: {
    story: string;
  };
}

const StorySingle: React.FC<StoryDetailProps> = ({ params }) => {
  const { story } = params;

  return (
    <>
      <StoryPage storySlug={story} />
    </>
  );
};

export async function generateMetadata({ params }: { params: { story: string } }): Promise<Metadata> {
  const storySlug = params.story;

  // Fetch the story details
  const query = `*[_type == "stories" && slug.current == $storySlug][0]`; // Assuming the type is "story"
  const storyDetail = await client.fetch(query, { storySlug });

  if (!storyDetail) {
    return { title: "Story not found" };
  }

  // Assuming urlFor generates an absolute URL
  const imageUrl = urlFor(storyDetail.featuredImage); 

  return {
    title: storyDetail.title,
    description: storyDetail.description,
    alternates: {
      canonical: `https://visitpowerful.com/stories/${storyDetail.slug.current}`, // Update the path
    },
    openGraph: {
      images: [
        {
          url: imageUrl,
          width: 900,
          height: 506
          // Removed 'type' field as it's typically inferred from the file extension
        },
      ],
      title: storyDetail.title,
      description: storyDetail.description,
      url: `https://visitpowerful.com/stories/${storyDetail.slug.current}`,
      siteName: 'Powerful',
      type: 'article', // Changed to 'article' for a story
    },
    twitter: {
      card: 'summary_large_image',
      title: storyDetail.title,
      description: storyDetail.description,
      siteId: '1467726470533754880', // Update if necessary
      creator: '@powerfulcreat',
      images: [{ url: imageUrl, width: 900, height: 506 }],
    },
    // Other metadata fields...
  };
}

export default StorySingle;
