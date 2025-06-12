"use client"

import { useAnimeGeneratedImages } from "@/app/lib/hooks/animeGeneratedImages"
import { createImageGeneration } from "@/app/utils/createImageGeneration"
import { uploadImageFromBlob } from "@/app/utils/uploadModaltosanity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Palette, Upload } from "lucide-react"
import type { Session } from "next-auth"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { ImageHistoryCard } from "../image-history-card"

interface AnimeStudioViewProps {
  session: Session | null
}

const stylePresets = {
  ghibli: "turn this into Ghibli Studio art style",
  pixar: "turn this into Pixar animated movie style",
  anime: "turn this into detailed anime style",
}

const aspectOptions = [
  { label: "1:1 (1024x1024)", value: "1024x1024" },
  { label: "3:2 (1536x1024)", value: "1536x1024" },
  { label: "2:3 (1024x1536)", value: "1024x1536" },
]

export function AnimeStudioView({ session }: AnimeStudioViewProps) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState<"ghibli" | "pixar" | "anime" | null>(null)
  const [aspect, setAspect] = useState("1024x1024")
  const [loading, setLoading] = useState(false)
  const [visibleCount, setVisibleCount] = useState(6)

  const loadMoreRef = useRef(null)
  const { images: animeImages, loading: loadingAnimeImages, refetch } = useAnimeGeneratedImages(session?.user?.id ?? "")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + 6)
        }
      },
      { rootMargin: "100px" },
    )

    const current = loadMoreRef.current
    if (current) observer.observe(current)

    return () => {
      if (current) observer.unobserve(current)
    }
  }, [])

  const generateAnimeImage = async () => {
    if (!imageFile || !style || !session?.user?.email || !session?.user?.id) {
      toast.error("Please upload image, select style, and ensure you're logged in")
      return
    }

    setLoading(true)

    const finalPrompt = prompt + " " + stylePresets[style]
    const formData = new FormData()
    formData.append("prompt", finalPrompt)
    formData.append("type_", "edit")
    formData.append("size", aspect)
    formData.append("n", "1")
    formData.append("quality", "medium")
    formData.append("imageFile", imageFile)

    try {
      const res = await fetch("https://powerful--openai-image-caller-openai-image-app.modal.run/", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error("Generation failed")

      const data = await res.json()
      const base64Image = data.images?.[0]
      if (!base64Image) throw new Error("No image returned from OpenAI")

      const blob = await fetch(base64Image).then((r) => r.blob())
      const asset = await uploadImageFromBlob(blob)

      if (!asset?._id) throw new Error("Failed to upload to Sanity")

      await createImageGeneration({
        prompt: finalPrompt,
        userId: session.user.id,
        imageAssetId: asset._id,
        aspectRatio: aspect,
        model: "openai",
      })

      await fetch("/api/user/credits/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session.user.email,
          creditsToDeduct: 2,
        }),
      })

      toast.success("Anime image created successfully!")
      setImageFile(null)
      setPrompt("")
      setStyle(null)
      await refetch()
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Creation Panel */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-purple-600" />
              Style Transformation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Upload Image</Label>
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center transition-colors hover:border-muted-foreground/50 hover:bg-muted/30 cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("border-blue-500", "bg-blue-50", "dark:bg-blue-950/20")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-blue-500", "bg-blue-50", "dark:bg-blue-950/20")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-blue-500", "bg-blue-50", "dark:bg-blue-950/20")
                  const file = e.dataTransfer.files?.[0]
                  if (file && (file.type === "image/png" || file.type === "image/jpeg")) {
                    setImageFile(file)
                  } else {
                    toast.error("Only PNG or JPEG images are supported")
                  }
                }}
              >
                {imageFile ? (
                  <div className="space-y-4">
                    <Image
                      src={URL.createObjectURL(imageFile) || "/placeholder.svg"}
                      alt="Preview"
                      width={250}
                      height={250}
                      className="mx-auto rounded-lg object-cover border"
                    />
                    <Button variant="destructive" onClick={() => setImageFile(null)}>
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your image here</p>
                      <p className="text-sm text-muted-foreground">or click to browse files</p>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="anime-upload"
                    />
                    <Button variant="outline" onClick={() => document.getElementById("anime-upload")?.click()}>
                      Select File
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Style Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose Style</Label>
              <div className="grid grid-cols-3 gap-3">
                {(["ghibli", "pixar", "anime"] as const).map((option) => (
                  <Button
                    key={option}
                    variant={style === option ? "default" : "outline"}
                    onClick={() => setStyle(option)}
                    className="h-auto p-4 flex flex-col gap-2"
                  >
                    <span className="font-medium capitalize">{option}</span>
                    <span className="text-xs opacity-70">
                      {option === "ghibli" && "Studio Ghibli"}
                      {option === "pixar" && "3D Animation"}
                      {option === "anime" && "Detailed Anime"}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Image Size</Label>
              <div className="grid grid-cols-3 gap-3">
                {aspectOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={aspect === opt.value ? "default" : "outline"}
                    onClick={() => setAspect(opt.value)}
                    className="text-xs"
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Optional Prompt */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Additional Details (Optional)</Label>
              <Textarea
                placeholder="Add any custom details to enhance the transformation..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateAnimeImage}
              disabled={loading || !imageFile || !style}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Transforming...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  <span>Transform to {style ? style.charAt(0).toUpperCase() + style.slice(1) : "Style"}</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Panel */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Style Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cost per image</span>
                <Badge variant="secondary">2 credits</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Processing time</span>
                <span className="text-sm font-medium">1-2 minutes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Model</span>
                <Badge>OpenAI DALL-E</Badge>
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium text-sm">Style Descriptions:</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong>Ghibli:</strong> Studio Ghibli's signature hand-drawn animation style with soft colors and
                  dreamy atmospheres
                </p>
                <p>
                  <strong>Pixar:</strong> 3D animated movie style with vibrant colors and expressive characters
                </p>
                <p>
                  <strong>Anime:</strong> Detailed Japanese anime art style with sharp lines and dynamic poses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Section */}
      {session?.user?.id && animeImages.length > 0 && (
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Your Anime Transformations</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAnimeImages ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {animeImages.slice(0, visibleCount).map((img) => (
                      <ImageHistoryCard key={img._id} img={img} currentUserId={session.user?.id} refetch={refetch} />
                    ))}
                  </div>
                  <div
                    ref={loadMoreRef}
                    className={`h-10 mt-4 w-full ${visibleCount >= animeImages.length ? "hidden" : ""}`}
                  />
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
