'use client'

import { cn } from '@/lib/utils'
import { renderWithCitations } from '@/utils/renderWithCitations'
import 'katex/dist/katex.min.css'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { Citing } from './custom-link'
import { CodeBlock } from './ui/codeblock'
import { MemoizedReactMarkdown } from './ui/markdown'

export function BotMessage({
  message,
  className,
  citationMap = {},
  modelId = 'unknown'
}: {
  message: string
  className?: string
  citationMap?: Record<string, number>
  modelId?: string
}) {
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(message || '')
  const processedMessage = preprocessLaTeX(message || '')

  // If the model is Gemini or citationMap is populated, inject clickable links
  const htmlWithCitations = renderWithCitations(processedMessage, citationMap, modelId)

  // Use dangerouslySetInnerHTML to render citation links only if citations are injected
  const shouldRenderHtml = Object.keys(citationMap).length > 0 || modelId.includes('gemini')

  if (shouldRenderHtml) {
    return (
      <div
        className={cn(
          'prose-sm prose-neutral prose-a:text-accent-foreground/50',
          className
        )}
        dangerouslySetInnerHTML={{ __html: htmlWithCitations }}
      />
    )
  }

  return (
    <MemoizedReactMarkdown
      rehypePlugins={[
        [rehypeExternalLinks, { target: '_blank' }],
        ...(containsLaTeX ? [rehypeKatex] : [])
      ]}
      remarkPlugins={[remarkGfm, ...(containsLaTeX ? [remarkMath] : [])]}
      className={cn(
        'prose-sm prose-neutral prose-a:text-accent-foreground/50',
        className
      )}
      components={{
        code({ node, inline, className, children, ...props }) {
          if (children.length && children[0] === '▍') {
            return <span className="mt-1 cursor-default animate-pulse">▍</span>
          }

          const match = /language-(\w+)/.exec(className || '')
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }

          return (
            <CodeBlock
              key={Math.random()}
              language={(match && match[1]) || ''}
              value={String(children).replace(/\n$/, '')}
              {...props}
            />
          )
        },
        a: Citing
      }}
    >
      {processedMessage}
    </MemoizedReactMarkdown>
  )
}

// LaTeX preprocessor for inline/block conversion
const preprocessLaTeX = (content: string) => {
  return content
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, eq) => `$$${eq}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, eq) => `$${eq}$`)
}
