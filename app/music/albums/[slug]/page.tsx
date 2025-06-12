import { client, urlFor } from '@/app/utils/sanityClient'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0


export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const album = await client.fetch(
    `*[_type == "musicAlbum" && slug.current == $slug][0]{
      title,
      description,
      coverImage {
        asset->
      }
    }`,
    { slug: params.slug }
  )

  if (!album) return {}

  const title = album.title || 'Album on Powerful'
  const description = album.description || 'Explore this music album on Powerful.'
  const imageUrl = album.coverImage ? urlFor(album.coverImage) : '/default-cover.jpg'

  return {
    title,
    description,
    robots: 'index, follow', // ✅ add this line
    openGraph: {
      title,
      description,
      url: `https://visitpowerful.com/music/albums/${params.slug}`,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
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

export default async function AlbumOverviewPage({
  params,
}: {
  params: { slug: string }
}) {
  const album = await client.fetch(
    `*[_type == "musicAlbum" && slug.current == $slug][0]{
      title,
      description,
      lyricist,
      coverImage,
      "songs": songs[]->{
        _id,
        title,
        slug,
        "artist": artist->name,
        coverImage {
          asset->
        }
      }
    }`,
    { slug: params.slug }
  )

  if (!album) return notFound()

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <Link href="/music" className="text-gray-500 hover:underline">
        &larr; Back to Music
      </Link>

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
          {album.description && (
            <p className="mt-2 text-gray-700">{album.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Songs in this Album</h2>
        {album.songs?.length > 0 ? (
          <ul className="space-y-2">
            {album.songs.map((song: any) => (
              <li key={song._id} className="flex items-center gap-4">
                {song.coverImage && (
                  <Image
                    src={urlFor(song.coverImage)}
                    alt={song.title}
                    width={60}
                    height={60}
                    className="rounded-md object-cover"
                  />
                )}
                <div>
                  <Link
                    href={`/music/albums/${params.slug}/${song.slug?.current}`}
                    className="text-lg font-medium text-black-600 hover:underline"
                  >
                    {song.title}
                  </Link>
                  <p className="text-sm text-gray-500">{song.artist}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No songs found.</p>
        )}
      </div>
    </div>
  )
}
