"use client"

import { Button } from "@/components/ui/button"
import { useSuggestions } from "@/hooks/useSuggestions"
import { ArrowRight, Loader2 } from "lucide-react"

export function EmptyScreen({
  submitMessage,
  className,
  inputQuery,
}: {
  submitMessage: (message: string) => void
  inputQuery: string
  className?: string
}) {
  const { suggestions, loading } = useSuggestions(inputQuery)

  // Default suggestions when no input
  const defaultSuggestions = [
    "What are the latest trends in AI?",
    "How to build a React application?",
    "Explain quantum computing simply",
    "Best practices for web development",
  ]

  const displaySuggestions = inputQuery.length >= 2 ? suggestions : defaultSuggestions
  const showLoading = loading && inputQuery.length >= 2

  return (
    <div className={`mx-auto w-full transition-all duration-300 ${className}`}>
      <div className="bg-background p-2">
        {/* Loading state */}
        {showLoading && (
          <div className="mt-2 mb-4 flex items-center gap-2 text-muted-foreground">
            <Loader2 size={16} className="animate-spin" />
            <p className="text-sm">Finding suggestions...</p>
          </div>
        )}

        {/* Suggestions */}
        {!showLoading && displaySuggestions.length > 0 && (
          <div className="mt-2 flex flex-col items-start space-y-2 mb-4">
            {displaySuggestions.map((message: string, index: number) => (
              <Button
                key={`${inputQuery.length >= 2 ? "dynamic" : "default"}-${index}`}
                variant="link"
                className="h-auto p-0 text-base text-left justify-start hover:text-primary transition-colors duration-200"
                onClick={() => submitMessage(message)}
              >
                <ArrowRight size={16} className="mr-2 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{message}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Empty state when no suggestions and not loading */}
        {!showLoading && displaySuggestions.length === 0 && inputQuery.length >= 2 && (
          <div className="mt-2 mb-4 text-center text-muted-foreground">
            <p className="text-sm">No suggestions found</p>
          </div>
        )}
      </div>  
    </div>
  )
}
