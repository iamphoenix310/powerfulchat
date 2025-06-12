'use client'

import dynamic from 'next/dynamic'

const ChatHistorySection = dynamic(() =>
  import('./chat-history-section').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => <div className="text-muted text-xs px-2 py-2">Loading history...</div>
  }
)

export function ChatHistorySectionWrapper() {
  return <ChatHistorySection />
}
