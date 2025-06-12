"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RefreshCw, Wand2 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface PromptGeneratorProps {
  onPromptGenerated: (prompt: string) => void
}

const promptTemplates = [
  "A majestic {subject} in a {setting} with {lighting} lighting, {style} style",
  "Portrait of a {subject} with {expression} expression, {background} background, {quality} quality",
  "A {subject} {action} in a {environment}, {weather} weather, {mood} mood",
  "Close-up of a {subject} with {details}, {color_scheme} color palette, {artistic_style}",
  "A {subject} surrounded by {elements}, {time_of_day} lighting, {camera_angle} angle",
]

const promptVariables = {
  subject: ["dragon", "warrior", "princess", "robot", "wizard", "phoenix", "tiger", "eagle"],
  setting: ["mystical forest", "ancient castle", "futuristic city", "mountain peak", "ocean depths", "desert oasis"],
  lighting: ["golden hour", "dramatic", "soft", "neon", "candlelit", "ethereal"],
  style: ["photorealistic", "oil painting", "watercolor", "digital art", "anime", "cinematic"],
  expression: ["serene", "fierce", "mysterious", "joyful", "contemplative", "determined"],
  background: ["blurred", "detailed landscape", "abstract", "starry sky", "urban", "natural"],
  quality: ["ultra-detailed", "high resolution", "masterpiece", "professional", "artistic"],
  action: ["flying", "running", "meditating", "dancing", "fighting", "exploring"],
  environment: ["enchanted garden", "cyberpunk alley", "crystal cave", "floating island", "ancient ruins"],
  weather: ["stormy", "sunny", "misty", "snowy", "rainy", "clear"],
  mood: ["epic", "peaceful", "mysterious", "energetic", "melancholic", "triumphant"],
  details: ["intricate patterns", "glowing eyes", "flowing hair", "ornate jewelry", "battle scars"],
  color_scheme: ["vibrant", "monochromatic", "warm tones", "cool blues", "earth tones", "neon"],
  artistic_style: ["renaissance", "impressionist", "surreal", "minimalist", "baroque", "modern"],
  elements: ["floating crystals", "magical particles", "ancient symbols", "glowing orbs", "swirling mist"],
  time_of_day: ["dawn", "sunset", "midnight", "noon", "twilight", "golden hour"],
  camera_angle: ["low", "high", "bird's eye", "worm's eye", "dutch", "straight-on"],
}

export function PromptGenerator({ onPromptGenerated }: PromptGeneratorProps) {
  const [generating, setGenerating] = useState(false)

  const generateRandomPrompt = () => {
    setGenerating(true)

    // Select random template
    const template = promptTemplates[Math.floor(Math.random() * promptTemplates.length)]

    // Replace variables with random values
    let prompt = template
    Object.entries(promptVariables).forEach(([key, values]) => {
      const randomValue = values[Math.floor(Math.random() * values.length)]
      prompt = prompt.replace(`{${key}}`, randomValue)
    })

    // Simulate generation delay for better UX
    setTimeout(() => {
      onPromptGenerated(prompt)
      setGenerating(false)
      toast.success("Prompt generated!")
    }, 500)
  }

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Need inspiration?</h3>
            <p className="text-xs text-muted-foreground">Generate a creative prompt to get started</p>
          </div>
          <Button variant="outline" size="sm" onClick={generateRandomPrompt} disabled={generating} className="shrink-0">
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            <span className="ml-2">Generate</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
