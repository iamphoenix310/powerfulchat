import { CoreMessage } from 'ai'
import { Model } from '../types/models'

// Override all token constraints by using a huge context window
export function getMaxAllowedTokens(model: Model): number {
  return Infinity // Effectively removes the limit
}

export function truncateMessages(
  messages: CoreMessage[],
  maxTokens: number
): CoreMessage[] {
  // Just preserve the original messages, optionally trim non-user lead-ins
  const orderedMessages = [...messages]

  // Optionally trim leading assistant/system messages if required
  while (orderedMessages.length > 0 && orderedMessages[0].role !== 'user') {
    orderedMessages.shift()
  }

  return orderedMessages
}
