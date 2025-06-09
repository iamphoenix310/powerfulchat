'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Link2, LogOut, Palette } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ExternalLinkItems } from './external-link-items'
import { ThemeMenuItems } from './theme-menu-items'
import { Button } from './ui/button'

interface UserMenuProps {
  user: User | null
}

export default function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="px-2 py-1 text-xs h-7"
          asChild
        >
          <a href="https://visitpowerful.com/auth?mode=login">Login</a>
        </Button>
        <Button
          size="sm"
          className="px-2 py-1 text-xs h-7"
          asChild
        >
          <a href="https://visitpowerful.com/auth?mode=signup">Sign Up</a>
        </Button>
      </div>
    )
  }

  const userName =
    user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null

  const getInitials = (name: string, email: string | undefined) => {
    if (name && name !== 'User') {
      const parts = name.trim().split(' ')
      if (parts.length > 1) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      return name.substring(0, 2).toUpperCase()
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U'
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || undefined} alt={userName} />
            <AvatarFallback>{getInitials(userName, user.email)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">
              {userName}
            </p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ThemeMenuItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Link2 className="mr-2 h-4 w-4" />
            <span>Links</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <ExternalLinkItems />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
