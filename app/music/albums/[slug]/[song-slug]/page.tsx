import { client, urlFor } from '@/app/utils/sanityClient'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { normalizeTrackData } from '@/app/lib/music/normalizeTrackData'
import AlbumPlayerWithQueue from '@/components/Music/Albums/AlbumPlayerWithQueue'
import Link from 'next/link'
import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: { slug: string; 'song-slug': string }
}): Promise<Metadata> {
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
    { slug: params.slug }
  )

  if (!album?.songs || album.songs.length === 0) return {}

  const song = album.songs.find((s: any) => s.slug?.current === params['song-slug'])

  if (!song) return {}

  const title = song.title || 'Now Playing'
  const description = song.description || 'Play this on Powerful'
  const imageUrl = song.coverImage ? urlFor(song.coverImage) : '/default-cover.jpg'

  return {
    title,
    description,
    robots: 'index, follow',
    openGraph: {
      title,
      description,
      url: `https://visitpowerful.com/music/albums/${params.slug}/${params['song-slug']}`,
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
  }
}




interface Props {
  params: {
    slug: string        // album slug
    'song-slug': string // song slug
  }
}

export default async function AlbumSongPage({ params }: Props) {
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
    { slug: params.slug }
  )

  if (!album || !album.songs || album.songs.length === 0) return notFound()

  const formattedTracks = normalizeTrackData(
    album.songs
      .filter((song: any) => song.r2FileUrl)
      .map((song: any) => ({
        ...song,
        slug: song.slug?.current,
        coverImageUrl: song.coverImage ? urlFor(song.coverImage) : urlFor(album.coverImage),
        albumSlug: params.slug // ✅ attach album slug for routing
      })),
    'album'
  )

  // ✅ Set the clicked song as first in queue
const currentIndex = formattedTracks.findIndex(t => t.slug === params['song-slug'])

if (currentIndex === -1) return notFound()


  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <div className="mb-4">
      <Link
        href={`/music/albums/${params.slug}`}
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
  )
}
