"use client"

import type React from "react"
import { useState } from "react"
import { Loader2, Lightbulb, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"
import { Textarea } from "@/components/ui/textarea"

interface PromptGeneratorProps {
  onPromptGenerated: (prompt: string) => void
}

const promptExamples = [
  "a warrior under moonlight",
  "futuristic cityscape",
  "underwater kingdom",
  "magical forest at dawn",
  "cyberpunk detective",
]

const PromptGenerator: React.FC<PromptGeneratorProps> = ({ onPromptGenerated }) => {
  const [idea, setIdea] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  const generatePrompt = async () => {
    if (!session?.user?.id) {
      toast.error("Login to generate prompt")
      return
    }
    if (!idea.trim()) {
      setError("Please enter an idea first")
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/modal/prompt-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      })
      if (!res.ok) throw new Error("Failed to generate prompt")
      const data = await res.json()
      if (data.prompt) {
        onPromptGenerated(data.prompt)
        setIdea("")
      } else {
        throw new Error("No prompt returned")
      }
    } catch (err) {
      console.error("❌ Failed to generate prompt", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-none shadow-sm">
      <CardContent className="p-0">
        <div className="space-y-4">
          <div className="relative w-full">
            <Textarea
              placeholder="Enter a simple idea..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              className="min-h-[100px] px-4 py-3 text-base resize-none pr-12"
            />
            <Lightbulb className="absolute top-3 right-4 text-gray-400 w-5 h-5 pointer-events-none" />
            <Button
              onClick={generatePrompt}
              disabled={loading || !idea.trim()}
              className="mt-3 w-full sm:w-auto text-base px-6"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4" />
                  Enhance Prompt
                </span>
              )}
            </Button>
          </div>
          {error && <div className="text-sm text-red-500 px-1">{error}</div>}

          <div>
            <span className="block text-base text-gray-500 mb-2">Try:</span>
            <div className="flex flex-wrap gap-2">
              {promptExamples.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setIdea(example)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-base px-4 py-2 transition font-medium shadow-sm border border-gray-200"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PromptGenerator
