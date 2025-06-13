import { normalizeTrackData } from '@/app/lib/music/normalizeTrackData';
import { client, urlFor } from '@/app/utils/sanityClient';
import AlbumPlayerWithQueue from '@/components/Music/Albums/AlbumPlayerWithQueue';
import type { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string; 'song-slug': string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug, 'song-slug': songSlug } = await params; // Await params

  const album = await client.fetch(
    `*[_type == "musicAlbum" && slug.current == $slug][0]{
      "songs": songs[]->{
        title,
        slug,
        description,
        coverImage {
          asset->
        }
      }
    }`,
    { slug }
  );

  if (!album?.songs || album.songs.length === 0) return {};

  const song = album.songs.find((s: any) => s.slug?.current === songSlug);

  if (!song) return {};

  const title = song.title || 'Now Playing';
  const description = song.description || 'Play this on Powerful';
  const imageUrl = song.coverImage ? urlFor(song.coverImage) : '/default-cover.jpg';

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `https://visitpowerful.com/music/albums/${slug}/${songSlug}`, // Use awaited slugs
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 1200,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function AlbumSongPage({ params }: Props) {
  const { slug, 'song-slug': songSlug } = await params; // Await params

  const album = await client.fetch(
    `*[_type == "musicAlbum" && slug.current == $slug][0]{
      _id,
      title,
      description,
      lyricist,
      coverImage,
      "songs": songs[]->{
        _id,
        title,
        slug,
        r2FileUrl,
        r2FileUrlmp3,
        lyrics,
        description,
        "artist": artist->name,
        coverImage {
          asset->
        }
      }
    }`,
    { slug }
  );

  if (!album || !album.songs || album.songs.length === 0) return notFound();

  const formattedTracks = normalizeTrackData(
    album.songs
      .filter((song: any) => song.r2FileUrl)
      .map((song: any) => ({
        ...song,
        slug: song.slug?.current,
        coverImageUrl: song.coverImage ? urlFor(song.coverImage) : urlFor(album.coverImage),
        albumSlug: slug // Use awaited slug
      })),
    'album'
  );

  const currentIndex = formattedTracks.findIndex(t => t.slug === songSlug);

  if (currentIndex === -1) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <div className="mb-4">
        <Link
          href={`/music/albums/${slug}`} // Use awaited slug
          className="text-gray-600 hover:underline text-sm inline-flex items-center gap-1"
        >
          ← Back to Album
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {album.coverImage && (
          <Image
            src={urlFor(album.coverImage)}
            alt={album.title}
            width={300}
            height={300}
            className="rounded-lg shadow"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{album.title}</h1>
          <p className="text-sm text-gray-600">By {album.lyricist || 'Unknown'}</p>
          {album.description && <p className="mt-2 text-gray-700">{album.description}</p>}
        </div>
      </div>

      <AlbumPlayerWithQueue trackList={formattedTracks} initialIndex={currentIndex} />
    </div>
  );
}