export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getRedisClient } from '@/lib/redis/config'
import { isProviderEnabled } from '@/lib/utils/registry'
import { cookies } from 'next/headers'

import { getAgentForMode } from '@/lib/agents/get-agent'
import { Model } from '@/lib/types/models'

export const maxDuration = 30

const DEFAULT_MODEL: Model = {
  id: 'gpt-4o-mini',
  name: 'GPT-4o mini',
  provider: 'OpenAI',
  providerId: 'openai',
  enabled: true,
  toolCallType: 'native'
}


export async function POST(req: Request) {
  try {
    const { messages, id: chatId } = await req.json()
    const referer = req.headers.get('referer')
    const isSharePage = referer?.includes('/share/')
    const userId = await getCurrentUserId()

    if (isSharePage) {
      return new Response('Chat API is not available on share pages', {
        status: 403,
        statusText: 'Forbidden'
      })
    }

    const cookieStore = await cookies()
    const modelJson = cookieStore.get('selectedModel')?.value
    const searchMode = cookieStore.get('search-mode')?.value === 'true'

    let selectedModel = DEFAULT_MODEL

    if (modelJson) {
      try {
        selectedModel = JSON.parse(modelJson) as Model
      } catch (e) {
        console.error('Failed to parse selected model:', e)
      }
    }

    if (
      !isProviderEnabled(selectedModel.providerId) ||
      selectedModel.enabled === false
    ) {
      return new Response(
        `Selected provider is not enabled ${selectedModel.providerId}`,
        {
          status: 404,
          statusText: 'Not Found'
        }
      )
    }

    // ✅ Get mode from Redis
    const redis = await getRedisClient()
    const chatData = await redis.hgetall<Record<string, any>>(`chat:${chatId}`)
    const chatMode = chatData?.mode || 'default'

  // ✅ Dynamically pick the correct agent/stream handler
  const handler = getAgentForMode(chatMode)
  return handler({
    messages,
    model: selectedModel,
    chatId,
    searchMode,
    userId,
    mode: chatMode
  })
  } catch (error) {
    console.error('API route error:', error)
    return new Response('Error processing your request', {
      status: 500,
      statusText: 'Internal Server Error'
    })
  }
}
