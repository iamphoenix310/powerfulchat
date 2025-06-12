"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Dices, ImagePlus } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

interface AdvancedControlsProps {
  model: string
  setModel: (val: string) => void
  generationType: string
  setGenerationType: (val: string) => void
  prompt: string
  setPrompt: (val: string) => void
  aspect: string
  setAspect: (val: string) => void
  style: string
  setStyle: (val: string) => void
  steps: number
  setSteps: (val: number) => void
  guidance: number
  setGuidance: (val: number) => void
  seed: number | null
  setSeed: (val: number | null) => void
  size: string
  setSize: (val: string) => void
  setQuality: (val: string) => void
  setFormat: (val: string) => void
  setBackground: (val: string) => void
  nImages: number
  setNImages: (val: number) => void
  imageFile: File | null
  setImageFile: (file: File | null) => void
  maskFile: File | null
  setMaskFile: (file: File | null) => void
}

const aspectOptions = [
  { label: "1:1", value: "1024x1024" },
  { label: "2:3", value: "832x1248" },
  { label: "3:2", value: "1248x832" },
  { label: "4:5", value: "864x1080" },
  { label: "16:9", value: "1280x720" },
  { label: "9:16", value: "720x1280" },
]

const styleOptions = [
  { label: "Surreal", value: "surreal dreamlike, melting forms" },
  { label: "Fantasy", value: "ethereal, glowing, high fantasy" },
  { label: "Cinematic", value: "cinematic lighting, shallow depth of field" },
  { label: "Cyberpunk", value: "neon lights, cyberpunk, urban decay" },
  { label: "Vintage", value: "vintage film grain, analog photo" },
  { label: "Oil Painting", value: "oil painting, rich brush strokes" },
  { label: "Macro", value: "macro, ultra sharp details" },
  { label: "Pencil", value: "pencil sketch, black and white lines" },
]

const sizeOptions = [
  { label: "1024x1024", value: "1024x1024" },
  { label: "1536x1024", value: "1536x1024" },
  { label: "1024x1536", value: "1024x1536" },
  { label: "Auto", value: "auto" },
]

export function AdvancedControls({
  model,
  setModel,
  generationType,
  setGenerationType,
  aspect,
  setAspect,
  style,
  setStyle,
  steps,
  setSteps,
  guidance,
  setGuidance,
  seed,
  setSeed,
  size,
  setSize,
  setQuality,
  setFormat,
  setBackground,
  nImages,
  setNImages,
  imageFile,
  setImageFile,
  maskFile,
  setMaskFile,
}: AdvancedControlsProps) {
  useEffect(() => {
    if (model === "flux") {
      setSteps(37)
      setGuidance(5.7)
      setNImages(1)
    } else if (model === "openai") {
      setQuality("medium")
      setFormat("png")
      setBackground("auto")
      setNImages(1)
    }
  }, [model, setSteps, setGuidance, setNImages, setQuality, setFormat, setBackground])

  const randomizeSeed = () => {
    const randomSeed = Math.floor(Math.random() * 999999999)
    setSeed(randomSeed)
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle>Advanced Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">AI Model</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={model === "flux" ? "default" : "outline"}
                  onClick={() => setModel("flux")}
                  className="h-auto p-3 flex flex-col gap-1"
                >
                  <span className="font-medium">Flux</span>
                  <span className="text-xs opacity-70">1 credit</span>
                </Button>
                <Button
                  variant={model === "openai" ? "default" : "outline"}
                  onClick={() => setModel("openai")}
                  className="h-auto p-3 flex flex-col gap-1"
                >
                  <span className="font-medium">DALL-E</span>
                  <span className="text-xs opacity-70">2 credits</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Number of Images</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={nImages === 1 ? "default" : "outline"} onClick={() => setNImages(1)}>
                  1 Image
                </Button>
                <Button variant={nImages === 2 ? "default" : "outline"} onClick={() => setNImages(2)}>
                  2 Images
                </Button>
              </div>
            </div>
          </div>

          {model === "openai" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Generation Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={generationType === "generate" ? "default" : "outline"}
                  onClick={() => setGenerationType("generate")}
                >
                  Generate New
                </Button>
                <Button
                  variant={generationType === "edit" ? "default" : "outline"}
                  onClick={() => setGenerationType("edit")}
                >
                  Edit Existing
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Size/Aspect Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">{model === "flux" ? "Aspect Ratio" : "Image Size"}</Label>
          <div className="grid grid-cols-3 gap-2">
            {(model === "flux" ? aspectOptions : sizeOptions).map((opt) => (
              <Button
                key={opt.value}
                variant={(model === "flux" ? aspect : size) === opt.value ? "default" : "outline"}
                onClick={() => (model === "flux" ? setAspect(opt.value) : setSize(opt.value))}
                className="text-xs"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Style Selection for Flux */}
        {model === "flux" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Style Preset</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={style === "default" ? "default" : "outline"}
                onClick={() => setStyle("default")}
                className="text-xs"
              >
                Default
              </Button>
              {styleOptions.map((opt) => (
                <Button
                  key={opt.value}
                  variant={style === opt.value ? "default" : "outline"}
                  onClick={() => setStyle(opt.value)}
                  className="text-xs"
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Parameters for Flux */}
        {model === "flux" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Steps: {steps}</Label>
              <Slider
                min={10}
                max={50}
                step={2}
                value={[steps]}
                onValueChange={(v) => setSteps(v[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Guidance: {guidance}</Label>
              <Slider
                min={2}
                max={15}
                step={0.5}
                value={[guidance]}
                onValueChange={(v) => setGuidance(v[0])}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Seed (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Random"
                  value={seed ?? ""}
                  onChange={(e) => setSeed(e.target.value ? Number(e.target.value) : null)}
                  className="flex-1"
                />
                <Button onClick={randomizeSeed} variant="outline" size="icon">
                  <Dices className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Image Upload for OpenAI Edit */}
        {model === "openai" && generationType === "edit" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Image to Edit</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {imageFile ? (
                  <div className="space-y-2">
                    <Image
                      src={URL.createObjectURL(imageFile) || "/placeholder.svg"}
                      alt="Uploaded"
                      width={200}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button variant="destructive" size="sm" onClick={() => setImageFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus className="mx-auto w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="image-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Mask (Optional)</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {maskFile ? (
                  <div className="space-y-2">
                    <Image
                      src={URL.createObjectURL(maskFile) || "/placeholder.svg"}
                      alt="Mask"
                      width={200}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button variant="destructive" size="sm" onClick={() => setMaskFile(null)}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ImagePlus className="mx-auto w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload mask for selective editing</p>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => setMaskFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="mask-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById("mask-upload")?.click()}>
                      Select Mask
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">White areas will be preserved, black areas will be edited</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
