'use client'

import { useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'

type Notification = {
  _id: string
  title: string
  message: string
  createdAt: string
  link?: string
  isRead: boolean
}

type Props = {
  notification: Notification
  onDelete?: (id: string) => void
}

export default function NotificationItem({ notification, onDelete }: Props) {
  const [isRead, setIsRead] = useState(notification.isRead)
  const [isDeleted, setIsDeleted] = useState(false)

  const handleClick = async () => {
    if (notification.link) {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: notification._id }),
      })
      setIsRead(true)
      window.location.href = notification.link
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation() // 🛑 Prevent bubbling to outer click
    await fetch('/api/notifications/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: notification._id }),
    })
    setIsDeleted(true)
    if (onDelete) onDelete(notification._id)
  }

  if (isDeleted) return null

  return (
    <div
      onClick={handleClick}
      className={`relative p-4 border-b hover:bg-gray-100 cursor-pointer ${
        !isRead ? 'bg-gray-50' : ''
      }`}
    >
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-600 hover:text-red-700"
        title="Delete notification"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      <p className="font-semibold">{notification.title}</p>
      <p className="text-sm text-gray-600">{notification.message}</p>
      <p className="text-xs text-gray-400">
        {new Date(notification.createdAt).toLocaleString()}
      </p>
    </div>
  )
}
