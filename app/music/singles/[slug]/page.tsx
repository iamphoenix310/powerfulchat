import { client, urlFor } from '@/app/utils/sanityClient'
import { normalizeTrackData } from '@/app/lib/music/normalizeTrackData'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import SingleTrackPlayer from '@/components/Music/Playing/MusicPlayerWithQueue'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const song = await client.fetch(
    `*[_type == "musicTrack" && slug.current == $slug && isSingle == true][0]{
      title,
      description,
      coverImage {
        asset->
      },
      slug
    }`,
    { slug: params.slug }
  )

  if (!song) return {}

  return {
    title: `${song.title}`,
    description: song.description || 'Listen to this track on Powerful.',
    robots: 'index, follow',
    openGraph: {
      title: song.title,
      description: song.description || 'Listen to this track on Powerful.',
      url: `https://visitpowerful.com/music/singles/${params.slug}`,
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
  }
}

export default async function SinglePage({ params }: { params: { slug: string } }) {
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
    { slug: params.slug }
  )

  if (!track) return notFound()

  const [formattedTrack] = normalizeTrackData(
    [
      {
        ...track,
        coverImageUrl: track.coverImage ? urlFor(track.coverImage) : '',
      },
    ],
    'single'
  )

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link href="/music" className="text-blue-500 hover:underline">
          &larr; Back to Music
        </Link>
      </div>
      <SingleTrackPlayer track={formattedTrack} />
    </div>
  )
}
