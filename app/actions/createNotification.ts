// app/actions/createNotification.ts

'use server'

import {client} from '@/app/utils/sanityClient'
import { revalidatePath } from 'next/cache'

type NotificationInput = {
  userId: string
  title: string
  message: string
  link?: string
}

export async function createNotification({ userId, title, message, link }: NotificationInput) {
  await client.create({
    _type: 'notification',
    user: { _type: 'reference', _ref: userId },
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
  })

  revalidatePath('/dashboard/notifications')
}
