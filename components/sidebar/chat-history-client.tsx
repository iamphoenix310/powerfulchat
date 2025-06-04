"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "@/components/ui/sidebar"
import type { Chat } from "@/lib/types"
import { Search, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import { toast } from "sonner"
import { ChatHistorySkeleton } from "./chat-history-skeleton"
import { ChatMenuItem } from "./chat-menu-item"
import { ClearHistoryAction } from "./clear-history-action"

interface ChatPageResponse {
  chats: Chat[]
  nextOffset: number | null
}

let debounceTimeout: NodeJS.Timeout

export function ChatHistoryClient() {
  const [chats, setChats] = useState<Chat[]>([])
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filteredChats, setFilteredChats] = useState<Chat[] | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [isPending, startTransition] = useTransition()

  const fetchInitialChats = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chats?offset=0&limit=20`)
      const { chats: newChats, nextOffset: newNextOffset } = (await response.json()) as ChatPageResponse
      setChats(newChats)
      setNextOffset(newNextOffset)
    } catch (err) {
      toast.error("Failed to load chat history.")
      setNextOffset(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInitialChats()
  }, [fetchInitialChats])

  useEffect(() => {
    const handleHistoryUpdate = () => {
      startTransition(() => {
        fetchInitialChats()
      })
    }
    window.addEventListener("chat-history-updated", handleHistoryUpdate)
    return () => {
      window.removeEventListener("chat-history-updated", handleHistoryUpdate)
    }
  }, [fetchInitialChats])

  const fetchMoreChats = useCallback(async () => {
    if (isLoading || nextOffset === null) return
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chats?offset=${nextOffset}&limit=20`)
      const { chats: newChats, nextOffset: newNextOffset } = (await response.json()) as ChatPageResponse
      setChats((prev) => [...prev, ...newChats])
      setNextOffset(newNextOffset)
    } catch (err) {
      toast.error("Failed to load more chats.")
    } finally {
      setIsLoading(false)
    }
  }, [nextOffset, isLoading])

  useEffect(() => {
    const observerRefValue = loadMoreRef.current
    if (!observerRefValue || nextOffset === null || isPending) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && !isPending) {
          fetchMoreChats()
        }
      },
      { threshold: 0.1 },
    )
    observer.observe(observerRefValue)
    return () => {
      if (observerRefValue) observer.unobserve(observerRefValue)
    }
  }, [fetchMoreChats, nextOffset, isLoading, isPending])

  // Live title search (local)
  useEffect(() => {
    if (!query.trim()) {
      setFilteredChats(null)
      return
    }

    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
      const q = query.trim().toLowerCase()
      const matches = chats.filter((chat) => chat.title?.toLowerCase().includes(q))
      setFilteredChats(matches)
    }, 300)
  }, [query, chats])

  const isHistoryEmpty =
    !isLoading &&
    ((filteredChats && filteredChats.length === 0) || (!filteredChats && chats.length === 0)) &&
    nextOffset === null

  const handleClear = () => {
    setQuery("")
    setFilteredChats(null)
  }

  const chatsToDisplay = filteredChats ?? chats

  return (
    <div className="flex flex-col flex-1 h-full">
      <SidebarGroup>
        <div className="flex items-center justify-between w-full">
          <SidebarGroupLabel className="p-0">History</SidebarGroupLabel>
          <ClearHistoryAction empty={isHistoryEmpty} />
        </div>

        {/* Elegant Search Section */}
        <div className="px-2 py-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
            <Input
              placeholder="Search conversations..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-10 h-9 bg-background/50 border-border/50 focus:bg-background focus:border-border text-xs transition-all duration-200 placeholder:text-muted-foreground/70"
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/80 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>

          {/* Search Results Indicator */}
          {query && filteredChats && (
            <div className="mt-2 px-1">
              <span className="text-xs text-muted-foreground">
                {filteredChats.length === 0
                  ? "No conversations found"
                  : `${filteredChats.length} conversation${filteredChats.length === 1 ? "" : "s"} found`}
              </span>
            </div>
          )}
        </div>
      </SidebarGroup>

      <div className="flex-1 overflow-y-auto mb-2 relative">
        {isHistoryEmpty && !isPending ? (
          <div className="px-2 text-foreground/30 text-sm text-center py-4">No chat history found</div>
        ) : (
          <SidebarMenu>
            {chatsToDisplay.map((chat) => (
              <ChatMenuItem key={chat.id} chat={chat} />
            ))}
          </SidebarMenu>
        )}
        <div ref={loadMoreRef} style={{ height: "1px" }} />
        {(isLoading || isPending) && (
          <div className="py-2">
            <ChatHistorySkeleton />
          </div>
        )}
      </div>
    </div>
  )
}
