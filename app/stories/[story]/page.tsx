import { client, urlFor } from '@/app/utils/sanityClient';
import StoryPage from '@/components/Stories/storiesPage';
import type { Metadata, ResolvingMetadata } from 'next';

interface StoryDetailProps {
  params: Promise<{ story: string }>;
}

export async function generateMetadata(
  { params }: StoryDetailProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { story: storySlug } = await params; // Await params

  try {
    const query = `*[_type == "stories" && slug.current == $storySlug][0]`;
    const storyDetail = await client.fetch(query, { storySlug });

    if (!storyDetail) {
      return { title: 'Story not found' };
    }

    const imageUrl = urlFor(storyDetail.featuredImage);

    return {
      title: storyDetail.title,
      description: storyDetail.description,
      alternates: {
        canonical: `https://visitpowerful.com/stories/${storyDetail.slug.current}`,
      },
      openGraph: {
        images: [
          {
            url: imageUrl,
            width: 900,
            height: 506,
          },
        ],
        title: storyDetail.title,
        description: storyDetail.description,
        url: `https://visitpowerful.com/stories/${storyDetail.slug.current}`,
        siteName: 'Powerful',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: storyDetail.title,
        description: storyDetail.description,
        siteId: '1467726470533754880',
        creator: '@powerfulcreat',
        images: [{ url: imageUrl, width: 900, height: 506 }],
      },
    };
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return { title: 'Story not found' };
  }
}

export default async function StorySingle({ params }: StoryDetailProps) {
  const { story } = await params; // Await params

  return <StoryPage storySlug={story} />;
}