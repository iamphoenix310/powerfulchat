"use client"

import { useEffect, useState } from "react"

export function useSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Set up debounced query with a longer delay (1.5 seconds)
  useEffect(() => {
    // Show loading state immediately for better UX
    if (query && query.length >= 2 && query !== debouncedQuery) {
      setLoading(true)
    }

    // Wait 1.5 seconds before updating the debounced query
    const debounceTimer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 1500) // 1.5 second debounce

    return () => clearTimeout(debounceTimer)
  }, [query])

  // Fetch suggestions only when debouncedQuery changes
  useEffect(() => {
    const controller = new AbortController()

    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([])
        setLoading(false)
        return
      }

      try {
        const res = await fetch("/api/suggestions", {
          method: "POST",
          body: JSON.stringify({ query: debouncedQuery }),
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
        })

        if (!res.ok) throw new Error("Failed to fetch suggestions")

        const { suggestions } = await res.json()
        setSuggestions(Array.isArray(suggestions) ? suggestions : [])
      } catch (error) {
        if (typeof error === "object" && error !== null && "name" in error && (error as { name: string }).name !== "AbortError") {
          console.warn("Failed to fetch suggestions:", error)
          setSuggestions([])
        }
      } finally {
        setLoading(false)
      }
    }

    // Execute immediately when debouncedQuery changes
    fetchSuggestions()

    return () => {
      controller.abort()
    }
  }, [debouncedQuery])

  return { suggestions, loading }
}
