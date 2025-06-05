"use client"

import type React from "react"

import { useAudioRecorder } from "@/hooks/whisper/useAudioRecorder"
import type { Model } from "@/lib/types/models"
import { cn } from "@/lib/utils"
import type { Message } from "ai"
import { ArrowUp, ChevronDown, MessageCirclePlus, Mic, MicOff, Square } from 'lucide-react'
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import Textarea from "react-textarea-autosize"
import { useArtifact } from "./artifact/artifact-context"
import { EmptyScreen } from "./empty-screen"
import { SearchModeToggle } from "./search-mode-toggle"
import { Button } from "./ui/button"

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: any) => void
  models?: Model[]
  /** Whether to show the scroll to bottom button */
  showScrollToBottomButton: boolean
  /** Reference to the scroll container */
  scrollContainerRef: React.RefObject<HTMLDivElement>
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append,
  models,
  showScrollToBottomButton,
  scrollContainerRef,
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const { close: closeArtifact } = useArtifact()
  const { recording, waveProgress, startRecording, stopRecording } = useAudioRecorder({
  onTranscribe: (text: string) => {
    // Instead of append, just set input value!
    handleInputChange({
      target: { value: text },
    } as React.ChangeEvent<HTMLTextAreaElement>);

    // Optionally, focus the textarea
    inputRef.current?.focus();
    handleScrollToBottom();
  }
});


  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push("/")
  }

  const isToolInvocationInProgress = () => {
    if (!messages.length) return false

    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role !== "assistant" || !lastMessage.parts) return false

    const parts = lastMessage.parts
    const lastPart = parts[parts.length - 1]

    return lastPart?.type === "tool-invocation" && lastPart?.toolInvocation?.state === "call"
  }

  // Handle suggestion click - set input and submit
 const handleSuggestionClick = (message: string) => {
  // Set the input value in state
  handleInputChange({
    target: { value: message },
  } as React.ChangeEvent<HTMLTextAreaElement>)

  // Use append directly to simulate user message submission
  append({
    role: 'user',
    content: message,
  })

  // Optional: scroll to bottom
  setTimeout(() => {
    handleScrollToBottom()
  }, 100)
}


  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        role: "user",
        content: query,
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Scroll to the bottom of the container
  const handleScrollToBottom = () => {
    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: "smooth",
      })
    }
  }

useEffect(() => {
  const handleStartNewChat = () => {
    setMessages([])
    closeArtifact()
    router.push('/')
  }

  window.addEventListener('start-new-chat', handleStartNewChat)

  return () => {
    window.removeEventListener('start-new-chat', handleStartNewChat)
  }
}, [setMessages, closeArtifact, router])


  return (
    <div
      className={cn(
        "w-full bg-background group/form-container shrink-0",
        messages.length > 0 ? "sticky bottom-0 px-2 pb-4" : "px-6",
      )}
    >
      {messages.length === 0 && (
        <div className="mb-10 flex flex-col items-center gap-4">
          <Image
            src="/images/logo-main.png"
            alt="Powerful Chatbot"
            width={50}
            height={50}
            className="w-10 h-10 object-contain"
          />
          <p className="text-center text-2xl font-semibold">How can I help you today?</p>
        </div>
      )}
      <form ref={formRef} onSubmit={handleSubmit} className={cn("max-w-3xl w-full mx-auto relative")}>
        {/* Scroll to bottom button - only shown when showScrollToBottomButton is true */}
        {showScrollToBottomButton && messages.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -top-10 right-4 z-20 size-8 rounded-full shadow-md"
            onClick={handleScrollToBottom}
            title="Scroll to bottom"
          >
            <ChevronDown size={16} />
          </Button>
        )}

        <div className="relative flex flex-col w-full gap-2 bg-muted rounded-3xl border border-input">
          <Textarea
            ref={inputRef}
            name="input"
            rows={2}
            maxRows={5}
            tabIndex={0}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            placeholder="Just ask anything..."
            spellCheck={false}
            value={input}
            disabled={isLoading || isToolInvocationInProgress()}
            className="resize-none w-full min-h-12 rounded-3xl bg-muted/60 text-foreground 
            placeholder:text-muted-foreground border border-transparent 
            p-4 text-sm focus:outline-none focus:ring-0 focus:border-transparent 
            focus-visible:outline-none focus-visible:ring-0"


            onChange={(e) => {
              handleInputChange(e)
              setShowEmptyScreen(e.target.value.length === 0)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !isComposing && !enterDisabled) {
                if (input.trim().length === 0) {
                  e.preventDefault()
                  return
                }
                e.preventDefault()
                const textarea = e.target as HTMLTextAreaElement
                textarea.form?.requestSubmit()
              }
            }}
            onFocus={() => setShowEmptyScreen(true)}
          />

          {/* Bottom menu area */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-2">
              {/* <ModelSelector models={models || []} /> */}
              <SearchModeToggle />
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewChat}
                  className="shrink-0 rounded-full group"
                  type="button"
                  disabled={isLoading || isToolInvocationInProgress()}
                >
                  <MessageCirclePlus className="size-4 group-hover:rotate-12 transition-all" />
                </Button>
              )}
              <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={cn("rounded-full", recording && "bg-red-100")}
                  disabled={isLoading || isToolInvocationInProgress()}
                >
                  {recording ? <MicOff className="text-red-500" size={18} /> : <Mic size={18} />}
                </Button>
                {recording && (
                  <div className="h-3 w-24 rounded-full bg-muted relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-primary transition-all duration-150"
                      style={{ width: `${waveProgress}%` }}
                    />
                  </div>
                )}

              <Button
                type={isLoading ? "button" : "submit"}
                size={"icon"}
                variant={"outline"}
                className={cn(isLoading && "animate-pulse", "rounded-full")}
                disabled={(input.length === 0 && !isLoading) || isToolInvocationInProgress()}
                onClick={isLoading ? stop : undefined}
              >
                {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
              </Button>
            </div>
          </div>
        </div>

        <div className="relative">
          {messages.length === 0 && (
            <div className="absolute top-0 left-0 right-0 min-h-[120px] max-h-[200px] overflow-hidden">
             <EmptyScreen
                  submitMessage={(message) => {
                    handleInputChange({
                      target: { value: message }
                    } as React.ChangeEvent<HTMLTextAreaElement>)

                    // Wait for state to propagate before submitting
                    setTimeout(() => {
                      const textarea = inputRef.current
                      if (textarea?.form) {
                        textarea.form.requestSubmit()
                      }
                    }, 20)
                  }}
                  inputQuery={input}
                 className={cn(
                    input.trim().length > 0 ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
                    'transition-opacity duration-200'
                  )}

                />

            </div>
          )}
          {/* Spacer to maintain layout stability */}
          {messages.length === 0 && <div className="h-[120px]" />}
        </div>
      </form>
    </div>
  )
}
