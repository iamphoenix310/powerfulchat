// app/music/layout.tsx
import { client, urlFor } from '@/app/utils/sanityClient'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const query = `*[_type == "musicTrack" && defined(coverImage)][0]{ title, coverImage }`
  const latestTrack = await client.fetch(query)

  const imageUrl = latestTrack?.coverImage ? urlFor(latestTrack.coverImage) : undefined
  const title = 'Listen Music on Powerful'

  return {
    title,
    description: 'Discover and listen to amazing original tracks.',
    openGraph: {
      title,
      description: 'Discover and listen to amazing original tracks.',
      url: `https://visitpowerful.com/music/`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: 'Discover and listen to amazing original tracks.',
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default function MusicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
