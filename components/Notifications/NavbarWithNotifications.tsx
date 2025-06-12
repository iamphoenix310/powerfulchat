'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useLiveNotifications } from '@/app/lib/hooks/useLiveNotifications'
import { BellIcon } from '@heroicons/react/24/outline'
import { useTransition } from 'react'
import NotificationItem from './NotificationItem'

export default function NavbarWithNotifications() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const notifications = useLiveNotifications(userId)
  const [isPending, startTransition] = useTransition()

  const unreadCount = notifications.filter(n => !n.isRead).length


  return (
    <div className="flex items-center justify-between p-4 bg-white shadow">
      <Link href="/" className="text-xl font-bold">ImageVerse</Link>

      <div className="relative group">
        <BellIcon className="w-6 h-6 text-gray-700 cursor-pointer" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}

        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50 hidden group-hover:block">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="font-semibold text-gray-700">Notifications</span>
            
          </div>

          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.map((n) => <NotificationItem key={n._id} notification={n} />)
          )}
        </div>
      </div>
    </div>
  )
}
