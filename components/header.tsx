'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import UserMenu from './user-menu'

export const Header: React.FC = () => {
  const { open } = useSidebar()

  return (
    <header
      className={cn(
        'absolute top-0 right-0 p-2 flex justify-between items-center z-10 backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent transition-[width] duration-200 ease-linear',
        open ? 'md:w-[calc(100%-var(--sidebar-width))]' : 'md:w-full',
        'w-full'
      )}
    >
      {/* Placeholder for logo/title */}
      <div />

      <div className="flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  )
}

export default Header
