// components/NotificationDropdown.tsx

'use client'

import { useSession } from 'next-auth/react'
import { useLiveNotifications } from '@/app/lib/hooks/useLiveNotifications'
import Link from 'next/link'
import { useTransition } from 'react'
import NotificationItem from './NotificationItem'

export default function NotificationDropdown() {
  const { data: session } = useSession()
  const userId = session?.user.id
  const notifications = useLiveNotifications(userId)
  const [isPending, startTransition] = useTransition()

  return (
    <div className="relative">
      <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.map((n) => <NotificationItem key={n._id} notification={n} />)
          )}
      </div>
    </div>
  )
}
