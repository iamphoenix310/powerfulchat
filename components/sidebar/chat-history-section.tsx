// ✅ components/sidebar/chat-history-section.tsx
import { ChatHistoryClient } from './chat-history-client'

export default function ChatHistorySection() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_SAVE_CHAT_HISTORY === 'true'

  if (!enabled) return null
  return <ChatHistoryClient />
}
