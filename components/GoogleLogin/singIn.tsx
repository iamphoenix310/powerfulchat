"use client"

import { useEffect, useRef, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { BellIcon, LogOut } from "lucide-react"
import { useLiveNotifications } from "@/app/lib/hooks/useLiveNotifications"
import NotificationItem from "@/components/Notifications/NotificationItem"
import { useTransition } from "react"
import { urlFor, newsClient } from "@/app/utils/sanityClient"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function SignIn() {
  const { data: session } = useSession()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [isMarkingAll, startTransition] = useTransition()

  const user = session?.user as any
  const username = user?.username || user?.name?.split(" ")[0]
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U"
  const firstName = user?.name?.split(" ")[0] || "User"

  const liveNotifications = useLiveNotifications(user?.id)
  const [notifications, setNotifications] = useState(liveNotifications)

  const [fullUser, setFullUser] = useState<any>(null)
  const [credits, setCredits] = useState<number | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return
      const res = await fetch("/api/user/user-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const data = await res.json()
      setFullUser(data)
    }

    const fetchCredits = async () => {
      if (!session?.user?.email) return
      try {
        const creditData = await newsClient.fetch(`*[_type == "user" && email == $email][0].subscriptionCredits`, {
          email: session.user.email,
        })
        setCredits(creditData)
      } catch (error) {
        console.error("Error fetching credits:", error)
      }
    }

    fetchUserData()
    fetchCredits()
  }, [session?.user?.email])

  useEffect(() => {
    setNotifications(liveNotifications)
  }, [liveNotifications])

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAllRead = () => {
    if (!user?.id) return

    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        isRead: true,
      })),
    )

    startTransition(() => {
      fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }).catch((err) => {
        console.error("❌ Mark all as read failed:", err)
      })
    })
  }

  if (session?.user) {
    return (
      <div className="flex items-center space-x-4">
        {/* Credits Display */}
        {credits === null || credits === 0 ? (
          <Link href="/subscription">
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs">
              Subscribe
            </Button>
          </Link>
        ) : (
          <Link href="/generate">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 transition-colors"
            >
              {credits} Credits
            </Badge>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <Popover open={notifOpen} onOpenChange={setNotifOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <BellIcon className="h-5 w-5" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {notifications.filter((n) => !n.isRead).length}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="font-medium">Notifications</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllRead}
                    disabled={isMarkingAll || notifications.length === 0}
                    className="h-7 text-xs"
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setNotifications([])
                      fetch("/api/notifications/clear-all", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ userId: user.id }),
                      })
                    }}
                    disabled={notifications.length === 0}
                    className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Clear all
                  </Button>
                </div>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                    <BellIcon className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onDelete={(id) => setNotifications((prev) => prev.filter((notif) => notif._id !== id))}
                    />
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                {fullUser?.profileImage?.asset?._ref ? (
                  <AvatarImage src={urlFor(fullUser.profileImage) || "/placeholder.svg"} alt={firstName} />
                ) : session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image || "/placeholder.svg"}
                    alt={firstName}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <AvatarFallback>{initials}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user?.name && <p className="font-medium">{user.name}</p>}
                {user?.email && <p className="w-[200px] truncate text-sm text-gray-500">{user.email}</p>}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/${user.username || "dashboard"}`}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => signOut()} className="text-red-600 focus:bg-red-50 focus:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  // Not Logged In
  return (
    <div className="flex items-center space-x-3">
      <Link href="/auth?mode=login">
        <Button variant="outline" size="sm">
          Login
        </Button>
      </Link>
      <Link href="/auth?mode=signup">
        <Button size="sm">Sign Up</Button>
      </Link>
    </div>
  )
}
