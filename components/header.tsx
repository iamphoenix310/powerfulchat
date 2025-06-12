'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import React from 'react'

interface HeaderProps {
  user: User | null
}
export const Header: React.FC = () => {
  const { open } = useSidebar()

  return (
    <header
      className={cn(
        'absolute top-0 right-0 p-2 flex justify-between items-center z-10',
        'backdrop-blur lg:backdrop-blur-none bg-background/80 lg:bg-transparent',
        'transition-[width] duration-200 ease-linear',
        open ? 'md:w-[calc(100%-var(--sidebar-width))]' : 'md:w-full',
        'w-full'
      )}
    >
      {/* Left spacer or logo */}
      <div className="flex items-center">
      </div>
      {/* Mobile center button */}
      
    </header>
  )
}

export default Header
