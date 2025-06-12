'use client'

import React, { useState, useEffect } from 'react'
import UniversalBottomBar from '@/components/universalBottomBar'
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShareIcon,
  PhotoIcon,
  PaintBrushIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import GlobalSearchBar from '@/components/Search/GlobalSearchBar'

const ClientOnlyBottomBar = () => {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ url: window.location.href })
    } else {
      alert('Sharing not supported')
    }
  }

  const toggleSearchOverlay = () => setSearchOpen(prev => !prev)

  return (
    <>
      <UniversalBottomBar
        items={[
          {
            label: 'Home',
            href: '/',
            icon: <HomeIcon className="w-6 h-6" />,
          },
          {
            label: 'Search',
            onClick: toggleSearchOverlay,
            icon: <MagnifyingGlassIcon className="w-6 h-6" />,
          },
          {
            label: 'Generate',
            href: '/generate',
            icon: <PaintBrushIcon className="w-6 h-6" />,
          },
          {
            label: 'Upload',
            href: '/upload',
            icon: <PlusIcon className="w-6 h-6" />,
          },
          {
            label: 'Images',
            href: '/images',
            icon: <PhotoIcon className="w-6 h-6" />,
          },
          {
            label: 'Share',
            icon: <ShareIcon className="w-6 h-6" />,
            onClick: handleNativeShare,
          },
        ]}
      />

      {/* Full-Screen Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 bg-white dark:bg-black z-50 flex flex-col px-4 py-6 animate-fadeIn overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Search</h2>
            <button
              onClick={toggleSearchOverlay}
              className="text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white text-xl"
            >
              &times;
            </button>
          </div>

          <div className="w-full max-w-xl mx-auto">
            <GlobalSearchBar onResultClick={() => setSearchOpen(false)} />

          </div>
        </div>
      )}
    </>
  )
}

export default ClientOnlyBottomBar
