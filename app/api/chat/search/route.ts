import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getRedisClient } from '@/lib/redis/config'
import { type Chat } from '@/lib/types'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const userId = await getCurrentUserId()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { query } = await req.json()
  if (!query || query.trim() === '') {
    return NextResponse.json({ error: 'Empty query' }, { status: 400 })
  }

  try {
    const redis = await getRedisClient()
    const userChatKey = `user:v2:chat:${userId}`
    const chatKeys = await redis.zrange(userChatKey, 0, -1, { rev: true })

    const chats = await Promise.all(
      chatKeys.map(async (chatKey) => {
        const chat = await redis.hgetall<Chat>(chatKey)
        if (!chat) return null
        if (typeof chat.messages === 'string') {
          try {
            chat.messages = JSON.parse(chat.messages)
          } catch {
            chat.messages = []
          }
        }
        return chat
      })
    )

    const lowerQuery = query.toLowerCase()
    const matchedChats = chats
      .filter(Boolean)
      .filter((chat) =>
        chat!.title?.toLowerCase().includes(lowerQuery) ||
        chat!.messages?.some((m) =>
          typeof m.content === 'string' && m.content.toLowerCase().includes(lowerQuery)
        )
      )

    return NextResponse.json({ results: matchedChats })
  } catch (error) {
    console.error('Chat search error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
