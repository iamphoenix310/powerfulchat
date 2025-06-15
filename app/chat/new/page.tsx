import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getRedisClient } from '@/lib/redis/config'
import { redirect } from 'next/navigation'
import { v4 as uuid } from 'uuid'

export default async function NewChatPage(props: {
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode = 'default' } = await props.searchParams

  const userId = await getCurrentUserId()
  const chatId = uuid()
  const redis = await getRedisClient()

  // Save chat metadata
  await redis.hmset(`chat:${chatId}`, {
    id: chatId,
    userId,
    mode,
    title: '',
    createdAt: Date.now(),
    path: `/search/${chatId}`
  })

  // Add to user's chat list
  await redis.zadd(`user:v2:chat:${userId}`, Date.now(), `chat:${chatId}`)

  // Redirect to chat page
  redirect(`/search/${chatId}`)
}
