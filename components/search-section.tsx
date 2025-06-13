'use client'

import { useArtifact } from '@/components/artifact/artifact-context'
import { CHAT_ID } from '@/lib/constants'
import type { SearchResults as TypeSearchResults } from '@/lib/types'
import { useChat } from '@ai-sdk/react'
import { ToolInvocation } from 'ai'
import { AnswerSection } from './answer-section'
import { CollapsibleMessage } from './collapsible-message'
import { SearchSkeleton } from './default-skeleton'
import { SearchResults } from './search-results'
import { SearchResultsImageSection } from './search-results-image'
import { Section, ToolArgsSection } from './section'

interface SearchSectionProps {
  tool: ToolInvocation
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchSection({
  tool,
  isOpen,
  onOpenChange
}: SearchSectionProps) {
  const { status } = useChat({ id: CHAT_ID })
  const isLoading = status === 'submitted' || status === 'streaming'
  const isToolLoading = tool.state === 'call'

  // 🛠 TypeScript-safe extraction of results
  const searchResults: TypeSearchResults | undefined =
    tool.state === 'result' ? (tool as any).result : undefined

  const query = tool.args?.query as string | undefined
  const includeDomains = tool.args?.includeDomains as string[] | undefined
  const includeDomainsString = includeDomains
    ? ` [${includeDomains.join(', ')}]`
    : ''

  const { open } = useArtifact()
  const header = (
    <button
      type="button"
      onClick={() => open({ type: 'tool-invocation', toolInvocation: tool })}
      className="flex items-center justify-between w-full text-left rounded-md p-1 -ml-1"
      title="Open details"
    >
      <ToolArgsSection
        tool="search"
        number={searchResults?.results?.length}
      >{`${query}${includeDomainsString}`}</ToolArgsSection>
    </button>
  )

  // ✅ Build citationMap from result URLs
  const citationMap: Record<string, number> = {}
  let index = 1
  for (const result of searchResults?.results || []) {
    if (result.url && !citationMap[result.url]) {
      citationMap[result.url] = index++
    }
  }

  // Optional: if using model store, get real modelId
  // const modelId = useModelStore().currentModelId || 'unknown'
  const modelId = 'gemini-2.0-flash' // hardcoded fallback

  return (
    <CollapsibleMessage
      role="assistant"
      isCollapsible={true}
      header={header}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      showIcon={false}
    >
      {Array.isArray(searchResults?.images) && searchResults.images.length > 0 && (
          <Section>
            <SearchResultsImageSection
              images={searchResults.images}
              query={query}
            />
          </Section>
        )}
      {isLoading && isToolLoading ? (
        <SearchSkeleton />
      ) : searchResults?.results ? (
        <>
          <Section title="Sources">
            <SearchResults results={searchResults.results} />
          </Section>
            <AnswerSection
              content={(tool as any)?.result?.text || ''}
              isOpen={true}
              onOpenChange={() => {}}
              messageId={tool.toolCallId}
              chatId={CHAT_ID}
              citationMap={citationMap}
              modelId={modelId}
            />
        </>
      ) : null}
    </CollapsibleMessage>
  )
}
