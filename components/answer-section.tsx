'use client'

import { useModelStore } from '@/lib/store/model-store'; // or wherever you track model ID
import { ChatRequestOptions } from 'ai';
import { CollapsibleMessage } from './collapsible-message';
import { DefaultSkeleton } from './default-skeleton';
import { BotMessage } from './message';
import { MessageActions } from './message-actions';

export type AnswerSectionProps = {
  content: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  chatId?: string
  showActions?: boolean
  messageId: string
  modelId?: string 
  reload?: (
    messageId: string,
    options?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  citationMap?: Record<string, number> // 🔍 Optional new prop
}

export function AnswerSection({
  content,
  isOpen,
  onOpenChange,
  chatId,
  showActions = true,
  messageId,
  reload,
  citationMap = {} // fallback empty
}: AnswerSectionProps) {
  const enableShare = process.env.NEXT_PUBLIC_ENABLE_SHARE === 'true'

  // Optional: get current model from global store
  const modelId = useModelStore.getState().currentModelId || 'unknown'

  const handleReload = () => {
    if (reload) return reload(messageId)
    return Promise.resolve(undefined)
  }

  const message = content ? (
    <div className="flex flex-col gap-1">
      <BotMessage
        message={content}
        citationMap={citationMap}
        modelId={modelId}
      />
      {showActions && (
        <MessageActions
          message={content}
          messageId={messageId}
          chatId={chatId}
          enableShare={enableShare}
          reload={handleReload}
        />
      )}
    </div>
  ) : (
    <DefaultSkeleton />
  )

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={false}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showBorder={false}
      showIcon={false}
    >
      {message}
    </CollapsibleMessage>
  )
}
