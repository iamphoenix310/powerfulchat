'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import UserMenu from './user-menu'

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
  {/* Left spacer (keeps layout balanced) */}
  <div className="w-10 sm:w-auto" />

  {/* Centered logo on mobile */}
  <div className="absolute left-1/2 -translate-x-1/2 block sm:hidden">
    <Link href="/" className="flex items-center justify-center">
      <Image
        src="/images/logo-main.png"
        alt="Powerful Chatbot"
        width={25}
        height={25}
        className="w-7 h-7 object-contain"
      />
    </Link>
  </div>

  {/* Right side - User Menu */}
  <div className="flex items-center gap-2">
    <UserMenu />
  </div>
</header>

  )
}

export default Header

// header comment