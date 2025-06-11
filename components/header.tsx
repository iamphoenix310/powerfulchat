'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import React from 'react'
import UserMenu from './user-menu'

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
      <div className="absolute left-1/2 -translate-x-1/2 block sm:hidden">
        <button
          onClick={() => {
            window.dispatchEvent(new Event('start-new-chat'))
          }}
          className="flex items-center justify-center"
          aria-label="Start new chat"
        >
          <Image
            src="/images/logo-main.png"
            alt="Start new chat"
            width={25}
            height={25}
            className="w-7 h-7 object-contain"
          />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
         <UserMenu />
      </div>
    </header>
  )
}

export default Header
