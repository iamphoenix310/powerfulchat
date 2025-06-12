'use client'

import { useEffect, useState } from 'react'
import { client } from '@/app/utils/sanityClient'

type Notification = {
  _id: string
  title: string
  message: string
  createdAt: string
  link?: string
  isRead: boolean
}

export const useLiveNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!userId) return

    const query = `
      *[_type == "notification" && user._ref == "${userId}"] | order(createdAt desc) {
        _id,
        title,
        message,
        isRead,
        createdAt,
        link
      }
    `

    client.fetch(query).then((data) => {
      setNotifications(data as Notification[])
    })

    const subscription = client
      .listen(query, {}, { includeResult: true })
      .subscribe((event: any) => {
        // Safe-guarded access
        const result = event?.result as Notification | undefined
        const transition = event?.transition
        const documentId = event?.documentId

        if (!result && transition !== 'disappear') return

        setNotifications((prev) => {
          if (transition === 'disappear' && documentId) {
            return prev.filter(n => n._id !== documentId)
          }

          if (result && (transition === 'appear' || transition === 'update' || transition === 'mutation')) {
            const withoutDuplicate = prev.filter(n => n._id !== result._id)
            return [result, ...withoutDuplicate].sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
          }

          return prev
        })
      })

    return () => subscription.unsubscribe()
  }, [userId])

  return notifications
}
