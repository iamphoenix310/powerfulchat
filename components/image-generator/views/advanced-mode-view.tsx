"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Sparkles, Zap } from "lucide-react"
import type { Session } from "next-auth"
import { useState } from "react"
import { AdvancedControls } from "../advanced-controls"

interface AdvancedModeViewProps {
  session: Session | null
}

export function AdvancedModeView({ session }: AdvancedModeViewProps) {
  const [model, setModel] = useState("flux")
  const [generationType, setGenerationType] = useState("generate")
  const [prompt, setPrompt] = useState("")
  const [aspect, setAspect] = useState("1024x1024")
  const [style, setStyle] = useState("default")
  const [steps, setSteps] = useState(37)
  const [guidance, setGuidance] = useState(5.7)
  const [seed, setSeed] = useState<number | null>(null)
  const [size, setSize] = useState("1024x1024")
  const [quality, setQuality] = useState("medium")
  const [format, setFormat] = useState("png")
  const [background, setBackground] = useState("auto")
  const [nImages, setNImages] = useState(1)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [maskFile, setMaskFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Controls */}
      <div className="lg:col-span-3 space-y-6">
        {/* Prompt Section */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Advanced Prompt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Label htmlFor="advanced-prompt" className="text-sm font-medium">
                Describe your image in detail
              </Label>
              <Textarea
                id="advanced-prompt"
                placeholder="A detailed description of the image you want to create with specific technical parameters..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Advanced Controls */}
        <AdvancedControls
          model={model}
          setModel={setModel}
          generationType={generationType}
          setGenerationType={setGenerationType}
          prompt={prompt}
          setPrompt={setPrompt}
          aspect={aspect}
          setAspect={setAspect}
          style={style}
          setStyle={setStyle}
          steps={steps}
          setSteps={setSteps}
          guidance={guidance}
          setGuidance={setGuidance}
          seed={seed}
          setSeed={setSeed}
          size={size}
          setSize={setSize}
          setQuality={setQuality}
          setFormat={setFormat}
          setBackground={setBackground}
          nImages={nImages}
          setNImages={setNImages}
          imageFile={imageFile}
          setImageFile={setImageFile}
          maskFile={maskFile}
          setMaskFile={setMaskFile}
        />

        {/* Generate Button */}
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <Button
              disabled={loading || !prompt.trim()}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span>Generate with {model === "flux" ? "Flux" : "DALL-E"}</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Sidebar */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5 text-purple-600" />
              Model Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Flux (Basic)</span>
                  <Badge variant="secondary">1 credit</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Fast generation (30-60s)</li>
                  <li>• Multiple aspect ratios</li>
                  <li>• Style presets available</li>
                  <li>• Advanced parameter control</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">DALL-E (Advanced)</span>
                  <Badge variant="default">2 credits</Badge>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Highest quality output</li>
                  <li>• Image editing capabilities</li>
                  <li>• Inpainting with masks</li>
                  <li>• Style transformations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Current Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Model</span>
              <Badge variant={model === "flux" ? "secondary" : "default"}>{model === "flux" ? "Flux" : "DALL-E"}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Images</span>
              <span className="font-medium">{nImages}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Size</span>
              <span className="font-medium">{model === "flux" ? aspect : size}</span>
            </div>
            {model === "flux" && (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Steps</span>
                  <span className="font-medium">{steps}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Guidance</span>
                  <span className="font-medium">{guidance}</span>
                </div>
              </>
            )}
            <Separator />
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total Cost</span>
              <span>{model === "flux" ? nImages : nImages * 2} credits</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
