'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { urlFor } from '@/app/utils/sanityClient'

interface Props {
  item: any
  type: 'album' | 'single'
}

export default function MusicCard({ item, type }: Props) {
  const router = useRouter()

  const isSingle = type === 'single'
  const slug =
    typeof item.slug === 'string'
      ? item.slug
      : typeof item.slug?.current === 'string'
      ? item.slug.current
      : null

  const href = slug
    ? isSingle
      ? `/music/singles/${slug}`
      : `/music/albums/${slug}`
    : '#'

  const handleClick = () => {
    if (slug) {
      router.push(href)
    }
  }

  return (
    <div onClick={handleClick} className="group block cursor-pointer">
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm relative">
        {item.coverImage && (
          <Image
            src={urlFor(item.coverImage)}
            alt={item.title || 'Cover Image'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 25vw"
            priority
          />
        )}
      </div>
      <div className="mt-2 text-center">
        <h3 className="text-lg font-semibold truncate">{item.title}</h3>
        <p className="text-sm text-gray-600 truncate">{item.artist || 'Unknown Artist'}</p>
      </div>
    </div>
  )
}
