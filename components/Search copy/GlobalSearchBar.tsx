"use client"

import { useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { useGlobalSearch } from '@/lib/hooks/useGlobalSearch'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/app/utils/sanityClient'
import { useOutsideClick } from '@/lib/hooks/useOutsideClick'
import { Search as SearchIcon } from 'lucide-react'

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
      className={`relative transition-all duration-300 ease-in-out ${
        isFocused || query ? 'w-[22rem] md:w-[20rem]' : 'w-[16rem] hover:w-[20rem]'
      }`}
      onFocus={() => setIsFocused(true)}
    >
      <div className="relative">
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Powerful..."
          className="pl-9 pr-4 py-2 rounded-full border-gray-300 text-base focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
      </div>

      {query && (
        <div className="absolute mt-2 w-full bg-white dark:bg-black border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-auto">
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
                  className="flex text-base items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  {image && (
                    <Image
                      src={urlFor(image)}
                      alt={item.title || 'Image'}
                      width={60}
                      height={60}
                      className="rounded-md object-cover"
                    />
                  )}
                  <div>
                    <div className="text-sm font-semibold">{item.title}</div>
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
