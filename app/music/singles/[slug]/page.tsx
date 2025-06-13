import { normalizeTrackData } from '@/app/lib/music/normalizeTrackData';
import { client, urlFor } from '@/app/utils/sanityClient';
import SingleTrackPlayer from '@/components/Music/Playing/MusicPlayerWithQueue';
import type { Metadata, ResolvingMetadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params; // Await params

  const song = await client.fetch(
    `*[_type == "musicTrack" && slug.current == $slug && isSingle == true][0]{
      title,
      description,
      coverImage {
        asset->
      },
      slug
    }`,
    { slug }
  );

  if (!song) return {};

  return {
    title: `${song.title}`,
    description: song.description || 'Listen to this track on Powerful.',
    robots: 'index, follow',
    openGraph: {
      title: song.title,
      description: song.description || 'Listen to this track on Powerful.',
      url: `https://visitpowerful.com/music/singles/${slug}`, // Use awaited slug
      images: [
        {
          url: urlFor(song.coverImage),
          width: 630,
          height: 630,
          alt: song.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: song.title,
      description: song.description || 'Listen to this track on Powerful.',
      images: [urlFor(song.coverImage)],
    },
  };
}

export default async function SinglePage({ params }: Props) {
  const { slug } = await params; // Await params

  const track = await client.fetch(
    `*[_type == "musicTrack" && slug.current == $slug && isSingle == true][0]{
      _id,
      title,
      "artist": artist->name,
      description,
      r2FileUrl,
      r2FileUrlmp3,
      slug,
      lyrics,
      coverImage {
        asset->
      }
    }`,
    { slug }
  );

  if (!track) return notFound();

  const [formattedTrack] = normalizeTrackData(
    [
      {
        ...track,
        coverImageUrl: track.coverImage ? urlFor(track.coverImage) : '',
      },
    ],
    'single'
  );

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/music" className="text-blue-500 hover:underline">
          ← Back to Music
        </Link>
      </div>
      <SingleTrackPlayer track={formattedTrack} />
    </div>
  );
}