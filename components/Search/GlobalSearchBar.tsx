'use client'

import { urlFor } from '@/app/utils/sanityClient'
import { Input } from '@/components/ui/input'
import { useGlobalSearch } from '@/lib/hooks/useGlobalSearch'
import { useOutsideClick } from '@/lib/hooks/useOutsideClick'
import { Search as SearchIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

interface GlobalSearchBarProps {
  onResultClick?: () => void
}

export default function GlobalSearchBar({ onResultClick }: GlobalSearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const { results, loading } = useGlobalSearch(query)

  useOutsideClick(wrapperRef, () => {
    setIsFocused(false)
    setQuery('')
  })

  return (
    <div
      ref={wrapperRef}
      className={`relative w-full transition-all duration-300 ease-in-out`}
      onFocus={() => setIsFocused(true)}
    >
      <div className="relative w-full">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Powerful..."
          className="pl-9 pr-4 py-2 w-full text-sm rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {query && (
        <div className="absolute left-0 mt-2 w-full bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : results.length > 0 ? (
            results.map((item) => {
              const link =
                item.type === 'article'
                  ? `/news/${item.slug?.current}`
                  : item.type === 'image'
                  ? `/images/${item.slug?.current}`
                  : item.type === 'music'
                  ? `/music/singles/${item.slug?.current}`
                  : item.type === 'feed'
                  ? `/feed/${item._id}`
                  : item.type === 'person'
                  ? `/people/${item.slug?.current}`
                  : item.type === 'product'
                  ? `/products/${item.slug?.current}`
                  : item.type === 'user'
                  ? `/users/${item.slug?.current || item._id}`
                  : item.type === 'movie'
                  ? `/movies/${item.slug?.current}`
                  : '#'

              const image =
                item.image ||
                item.coverImage ||
                item.mainimage ||
                item.profileImage ||
                item.mainImage ||
                item.poster

              return (
                <Link
                  key={item._id}
                  href={link}
                  onClick={() => {
                    setQuery('')
                    setIsFocused(false)
                    onResultClick?.()
                  }}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {image && (
                    <Image
                      src={urlFor(image)}
                      alt={item.title || 'Image'}
                      width={48}
                      height={48}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-semibold line-clamp-1">{item.title}</div>
                    <div className="text-xs text-gray-500 capitalize">{item.type}</div>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="p-4 text-center text-gray-400">No results found</div>
          )}
        </div>
      )}
    </div>
  )
}
