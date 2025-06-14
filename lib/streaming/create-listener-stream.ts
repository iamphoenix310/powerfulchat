import { getChat } from '@/lib/actions/chat'
import {
  convertToCoreMessages,
  createDataStreamResponse,
  DataStreamWriter,
  streamText
} from 'ai'
import { listenerAgent } from '../agents/listener'
import { getMaxAllowedTokens, truncateMessages } from '../utils/context-window'
import { handleStreamFinish } from './handle-stream-finish'
import { BaseStreamConfig } from './types'

export function createListenerStreamResponse(config: BaseStreamConfig) {
  return createDataStreamResponse({
    execute: async (dataStream: DataStreamWriter) => {
      const { messages, model, chatId, userId } = config
      const modelId = `${model.providerId}:${model.id}`

      // ✅ Fetch mode from Redis-stored chat metadata
      const chat = await getChat(chatId, userId)
      const mode = chat?.mode || 'default'

      try {
        const coreMessages = convertToCoreMessages(messages)
        const truncatedMessages = truncateMessages(
          coreMessages,
          getMaxAllowedTokens(model)
        )

        const listenerConfig = listenerAgent({
          messages: truncatedMessages,
          model: modelId
        })

        const result = streamText({
          ...listenerConfig,
          onFinish: async result => {
            await handleStreamFinish({
              responseMessages: result.response.messages,
              originalMessages: messages,
              model: modelId,
              chatId,
              dataStream,
              userId,
              mode, // ✅ dynamic mode passed in
              skipRelatedQuestions: true
            })
          }
        })

        result.mergeIntoDataStream(dataStream)
      } catch (error) {
        console.error('Stream execution error (listener):', error)
        throw error
      }
    },
    onError: error => {
      return error instanceof Error ? error.message : String(error)
    }
  })
}
