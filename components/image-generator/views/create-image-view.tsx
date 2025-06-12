"use client"

import { createImageGeneration } from "@/app/utils/createImageGeneration"
import { urlFor } from "@/app/utils/sanityClient"
import { uploadImageFromBlob } from "@/app/utils/uploadModaltosanity"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Loader2, Settings2, Sparkles, UploadCloud, Wand2, XCircle, Zap } from "lucide-react"
import type { Session } from "next-auth"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { GeneratedImages } from "../generated-images"
import { PromptGenerator } from "../prompt-generator"

interface CreateImageViewProps {
  session: Session | null
  setShowLoginModal: (show: boolean) => void
}

const aspectOptions = [
  { value: "1:1", label: "Square (1:1)" },
  { value: "3:4", label: "Portrait (3:4)" },
  { value: "4:3", label: "Landscape (4:3)" },
  { value: "16:9", label: "Wide (16:9)" },
  { value: "9:16", label: "Story (9:16)" },
  { value: "4:5", label: "Instagram (4:5)" },
]

const promptTips = [
  "✨ Include clear subject details for better accuracy.",
  "🌅 Bright daylight scenes produce vibrant images.",
  "🎨 Mention color schemes for visually appealing outcomes.",
  "📸 Request ultra-detailed textures for realism.",
  "⚡️ Dynamic poses create engaging visuals.",
  "🌄 Clearly describe the environment and surroundings.",
  "😊 Add mood or emotion keywords for expressive images.",
  "🎬 Mention camera angles for cinematic effects.",
  "🖼️ Specify the style explicitly (realistic, cinematic).",
  "📐 Use descriptive adjectives for vivid outputs.",
]

export function CreateImageView({ session, setShowLoginModal }: CreateImageViewProps) {
  const [prompt, setPrompt] = useState("")
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [numberOfImages, setNumberOfImages] = useState(1)
  const [promptOptimizer, setPromptOptimizer] = useState(true)
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<{ url: string; aspectRatio: string }[]>([])
  const [statusText, setStatusText] = useState("")
  const [currentTip, setCurrentTip] = useState(0)
  const [subjectFile, setSubjectFile] = useState<File | null>(null)
  const [subjectUrl, setSubjectUrl] = useState<string>("")
  const [uploadingSubject, setUploadingSubject] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % promptTips.length)
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const handleSubjectFile = async (file: File) => {
    setUploadingSubject(true)
    setSubjectFile(file)
    try {
      const asset = await uploadImageFromBlob(file)
      const url = asset?.url || (asset && urlFor(asset))
      setSubjectUrl(url)
    } catch (err) {
      toast.error("Failed to upload subject image")
      setSubjectUrl("")
    }
    setUploadingSubject(false)
  }

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first")
      return
    }
    if (!session?.user?.email) {
      setShowLoginModal(true)
      return
    }

    setLoading(true)
    setImages([])
    setStatusText("Starting generation...")

    try {
      // Check subscription/credits
      const userCheckRes = await fetch("/api/user/users-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      })
      const userData = await userCheckRes.json()

      if (!userData?.subscriptionActive) {
        toast.error("🚫 You do not have an active subscription. Please subscribe first.")
        setLoading(false)
        return
      }

      const creditsAvailable = userData?.subscriptionCredits || 0
      const creditsPerImage = 1
      const totalCreditsNeeded = creditsPerImage * numberOfImages

      if (creditsAvailable < totalCreditsNeeded) {
        toast.error(`🚫 Not enough credits. Needed ${totalCreditsNeeded}, you have ${creditsAvailable}.`)
        setLoading(false)
        return
      }

      // Start prediction
      const res = await fetch("/api/modal/image-generation/minimax", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          aspect_ratio: aspectRatio,
          number_of_images: numberOfImages,
          prompt_optimizer: promptOptimizer,
          ...(subjectUrl && { subject_reference: subjectUrl }),
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error("Failed to start generation: " + text)
      }

      const data = await res.json()
      if (!data?.predictionId) throw new Error("Failed to start prediction: No predictionId")

      setStatusText(data.status || "Processing...")

      // Poll for status
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/modal/image-generation/minimax?predictionId=${data.predictionId}`)
          const pollData = await pollRes.json()

          setStatusText(pollData.statusText || pollData.status || "Processing...")

          if (pollData.status === "succeeded") {
            clearInterval(pollingRef.current!)
            setStatusText("Uploading to gallery...")

            const uploads = (pollData.output || []).map(async (imgUrl: string) => {
              try {
                const blob = await fetch(imgUrl).then((r) => r.blob())
                const asset = await uploadImageFromBlob(blob)
                if (asset && session?.user?.id) {
                  await createImageGeneration({
                    prompt,
                    userId: session.user.id,
                    imageAssetId: asset._id,
                    aspectRatio,
                    model: "minimax",
                  })
                }
                return { url: URL.createObjectURL(blob), aspectRatio }
              } catch (err) {
                return { url: "/placeholder.svg?height=512&width=512", aspectRatio }
              }
            })

            const imagesArr = await Promise.all(uploads)
            setImages(imagesArr)
            setStatusText("Generation complete!")

            // Deduct credits
            await fetch("/api/user/credits/deduct", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: session.user.email,
                creditsToDeduct: totalCreditsNeeded,
              }),
            })

            setLoading(false)
          }

          if (pollData.status === "failed") {
            clearInterval(pollingRef.current!)
            setLoading(false)
            toast.error("Image generation failed")
            setStatusText("Generation failed")
          }
        } catch (err: any) {
          clearInterval(pollingRef.current!)
          setLoading(false)
          setStatusText("Error polling progress")
        }
      }, 2000)
    } catch (error: any) {
      setLoading(false)
      setStatusText("Error: " + error.message)
      toast.error("Generation failed: " + error.message)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Main Creation Panel - Takes up 3 columns */}
      <div className="lg:col-span-3 space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wand2 className="h-5 w-5 text-purple-600" />
              Create Your Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prompt Generator */}
            <PromptGenerator onPromptGenerated={setPrompt} />

            {/* Main Prompt Input */}
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Describe your image
              </Label>
              <Textarea
                id="prompt"
                placeholder="A majestic dragon soaring through clouds at sunset, cinematic lighting, ultra detailed..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px] resize-none border-muted-foreground/20 focus:border-purple-500"
              />
            </div>

            {/* Subject Image Upload */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Reference Image (Optional)</Label>
              <div
                className={`relative rounded-lg border-2 border-dashed transition-all duration-200 ${
                  uploadingSubject
                    ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                    : subjectUrl
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
                } p-6 text-center cursor-pointer group`}
                onClick={() => !uploadingSubject && !subjectUrl && inputRef.current?.click()}
              >
                {!subjectUrl ? (
                  <div className="space-y-3">
                    <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground group-hover:text-foreground transition-colors" />
                    <div>
                      <p className="text-sm font-medium">
                        {uploadingSubject ? "Uploading..." : "Click to upload reference image"}
                      </p>
                      <p className="text-xs text-muted-foreground">Guide the AI with a reference photo</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="relative">
                      <Image
                        src={subjectUrl || "/placeholder.svg"}
                        alt="Reference"
                        width={100}
                        height={100}
                        className="rounded-lg object-cover border-2 border-green-500"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSubjectFile(null)
                          setSubjectUrl("")
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">Reference image ready</p>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleSubjectFile(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>

            <Separator className="my-6" />

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Aspect Ratio</Label>
                <Select value={aspectRatio} onValueChange={setAspectRatio}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {aspectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Number of Images</Label>
                <Select
                  value={numberOfImages.toString()}
                  onValueChange={(value) => setNumberOfImages(Number.parseInt(value))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "Image" : "Images"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Model</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/30">
                  <Badge variant="secondary" className="text-xs">
                    MiniMax
                  </Badge>
                  <span className="ml-2 text-xs text-muted-foreground">1 credit/image</span>
                </div>
              </div>
            </div>

            {/* Prompt Optimizer */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Prompt Optimizer</Label>
                <p className="text-xs text-muted-foreground">Enhance your prompt for better results</p>
              </div>
              <Switch checked={promptOptimizer} onCheckedChange={setPromptOptimizer} />
            </div>

            {/* Generate Button */}
            <Button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{statusText || "Generating..."}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <span>Generate {numberOfImages > 1 ? `${numberOfImages} Images` : "Image"}</span>
                </div>
              )}
            </Button>

            {/* Loading Tips */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
              >
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Tip:</strong> {promptTips[currentTip]}
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Generated Images */}
        {images.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Generated Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GeneratedImages images={images} prompt={prompt} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Info Sidebar - Takes up 1 column */}
      <div className="space-y-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5 text-purple-600" />
              Pro Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentTip}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200/50 dark:border-purple-800/50"
            >
              <p className="text-sm leading-relaxed">{promptTips[currentTip]}</p>
            </motion.div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Generation Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Model</span>
                <Badge variant="secondary">MiniMax</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cost per image</span>
                <span className="font-medium">1 credit</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Est. time</span>
                <span className="font-medium">30-60s</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Quality</span>
                <Badge variant="outline">High</Badge>
              </div>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• High-quality AI image generation</p>
              <p>• Multiple aspect ratios supported</p>
              <p>• Reference image guidance</p>
              <p>• Prompt optimization available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">MiniMax Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Fast generation (30-60s)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">High-quality outputs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Multiple aspect ratios</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Reference image support</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Prompt optimization</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
