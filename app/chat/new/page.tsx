import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getRedisClient } from '@/lib/redis/config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { v4 as uuid } from 'uuid'

export default async function NewChatPage(props: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode = 'default' } = await props.searchParams

  const requestHeaders = await headers()
  const isPrefetch =
    requestHeaders.get('x-middleware-prefetch') === '1' ||
    requestHeaders.get('next-router-prefetch') === '1' ||
    requestHeaders.get('Next-Router-Prefetch') === '1' ||
    requestHeaders.get('purpose') === 'prefetch'

  // Avoid creating a chat during link prefetches which can cause duplicates

  if (isPrefetch) {
    return null
  }

  const userId = await getCurrentUserId()
  const chatId = uuid()
  const redis = await getRedisClient()

  // Save chat metadata
  await redis.hmset(`chat:${chatId}`, {
    id: chatId,
    userId,
    mode,
    title: '',
    createdAt: new Date().toISOString(),
    path: `/search/${chatId}`
  })

  // Add to user's chat list
  await redis.zadd(`user:v2:chat:${userId}`, Date.now(), `chat:${chatId}`)

  // Redirect to chat page
  redirect(`/search/${chatId}`)
}
