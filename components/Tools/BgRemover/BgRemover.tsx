"use client"

import type React from "react"

import AdBlock from "@/components/Ads/AdBlock"
import { LoginModal } from "@/components/GoogleLogin/LoginModel"
import BgRemovedHistory from "@/components/Tools/BgRemover/BgRemovedHistory"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBgRemovedImages } from "@/lib/hooks/useBgRemovedImages"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
  UploadCloud,
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRef, useState } from "react"
import { toast } from "react-hot-toast"

export default function BgRemover() {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [originalPreview, setOriginalPreview] = useState<string | null>(null)
  const [outputPreview, setOutputPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch history
  const { images: history, loading: historyLoading } = useBgRemovedImages(session?.user?.id)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!session?.user) {
      setShowLoginModal(true)
      return
    }
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setOriginalPreview(URL.createObjectURL(selected))
      setOutputPreview(null)
      setActiveTab("process")
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    if (!session?.user) {
      setShowLoginModal(true)
      return
    }

    setLoading(true)

    try {
      const uploadForm = new FormData()
      uploadForm.append("file", file)

      const res = await fetch("/api/bg-removed/process", {
        method: "POST",
        body: uploadForm,
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error("❌ API /process failed response:", errorText)
        throw new Error("Server returned error")
      }

      const { outputUrl } = await res.json()

      if (!outputUrl) {
        throw new Error("Replicate output missing or malformed")
      }

      const imageRes = await fetch(outputUrl)
      if (!imageRes.ok || !imageRes.headers.get("content-type")?.startsWith("image")) {
        throw new Error("Invalid image fetched from Replicate")
      }

      const resultBlob = await imageRes.blob()
      const resultUrl = URL.createObjectURL(resultBlob)

      setOutputPreview(resultUrl)
      setActiveTab("result")

      const uploadForm2 = new FormData()
      uploadForm2.append("file", resultBlob, file.name.replace(/\.[^/.]+$/, "") + "-no-bg.png")
      uploadForm2.append("originalFilename", file.name)

      await fetch("/api/bg-removed/upload", {
        method: "POST",
        body: uploadForm2,
      })

      toast.success("Background removed successfully!")
    } catch (err) {
      console.error("❌ Background removal failed:", err)
      toast.error("Failed to remove background. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFile(null)
    setOriginalPreview(null)
    setOutputPreview(null)
    setLoading(false)
    setActiveTab("upload")
  }

  const handleDownload = () => {
    if (!outputPreview) return
    const link = document.createElement("a")
    link.href = outputPreview
    link.download = `${file?.name.split(".")[0] || "image"}-no-bg.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Download started!")
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Background Remover</h1>
            <p className="text-muted-foreground">Remove backgrounds from images instantly with AI precision</p>
          </div>
        </div>

        {!session?.user && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              🔐 Sign up required to use this tool - completely free!
            </p>
          </div>
        )}
      </div>

      {/* Ad Block */}
      <div className="rounded-lg overflow-hidden shadow-sm">
        <AdBlock adSlot="8397118667" className="w-full" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Tool - Takes up 3 columns */}
        <div className="lg:col-span-3">
          <Card className="border-0 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload" disabled={loading} className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium">
                      1
                    </span>
                    Upload
                  </TabsTrigger>
                  <TabsTrigger value="process" disabled={!file || loading} className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium">
                      2
                    </span>
                    Process
                  </TabsTrigger>
                  <TabsTrigger value="result" disabled={!outputPreview} className="flex items-center gap-2">
                    <span className="bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium">
                      3
                    </span>
                    Result
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="space-y-6">
                <TabsContent value="upload" className="mt-0">
                  <div
                    className={cn(
                      "w-full border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center transition-all cursor-pointer",
                      loading
                        ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 animate-pulse pointer-events-none"
                        : "border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:border-purple-500 dark:hover:border-purple-600 hover:bg-purple-100 dark:hover:bg-purple-950/50",
                    )}
                    onClick={() => {
                      if (!loading) fileInputRef.current?.click()
                    }}
                    onDragOver={(e) => {
                      if (!loading) {
                        e.preventDefault()
                        e.stopPropagation()
                      }
                    }}
                    onDrop={(e) => {
                      if (!loading) {
                        e.preventDefault()
                        e.stopPropagation()
                        const droppedFile = e.dataTransfer.files?.[0]
                        if (droppedFile && droppedFile.type.startsWith("image/")) {
                          if (!session?.user) {
                            setShowLoginModal(true)
                            return
                          }
                          setFile(droppedFile)
                          setOriginalPreview(URL.createObjectURL(droppedFile))
                          setOutputPreview(null)
                          setActiveTab("process")
                        } else {
                          toast.error("Please drop an image file (JPG, PNG, WEBP)")
                        }
                      }
                    }}
                  >
                    <UploadCloud className="w-16 h-16 mb-4 text-purple-500" />
                    <h3 className="text-xl font-semibold mb-2 text-purple-700 dark:text-purple-300">
                      Click or drag image here
                    </h3>
                    <p className="text-sm text-muted-foreground text-center max-w-xs mb-4">
                      Supports JPG, PNG and WEBP formats up to 10MB
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      AI-Powered • Instant Results
                    </Badge>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={loading}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="process" className="mt-0">
                  {originalPreview && (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                          Ready to Process
                        </h3>

                        <div className="w-full max-w-md">
                          <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-800 shadow-sm">
                            <Image
                              src={originalPreview || "/placeholder.svg"}
                              alt="Original"
                              width={500}
                              height={500}
                              className="object-contain w-full h-auto max-h-[400px]"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={() => {
                            if (!session?.user) {
                              setShowLoginModal(true)
                              return
                            }
                            handleSubmit()
                          }}
                          disabled={loading}
                          size="lg"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                          {loading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="animate-spin h-5 w-5" />
                              <span>Processing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="h-5 w-5" />
                              <span>Remove Background</span>
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          )}
                        </Button>

                        <Button variant="outline" onClick={handleReset} size="lg">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Start Over
                        </Button>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="result" className="mt-0">
                  {outputPreview && (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h3 className="text-lg font-semibold mb-4 flex items-center justify-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Background Removed Successfully!
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium text-center">Original</h4>
                          <div className="rounded-lg overflow-hidden border bg-white dark:bg-gray-800 shadow-sm">
                            <Image
                              src={originalPreview! || "/placeholder.svg"}
                              alt="Original"
                              width={500}
                              height={500}
                              className="object-contain w-full h-auto max-h-[300px]"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-center">Background Removed</h4>
                          <div className="rounded-lg overflow-hidden border shadow-sm bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 relative">
                            {/* Transparency checker pattern */}
                            <div
                              className="absolute inset-0 opacity-20"
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg width='20' height='20' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='10' height='10' fill='%23000'/%3e%3crect x='10' y='10' width='10' height='10' fill='%23000'/%3e%3c/svg%3e")`,
                                backgroundSize: "20px 20px",
                              }}
                            />
                            <Image
                              src={outputPreview || "/placeholder.svg"}
                              alt="Background removed"
                              width={500}
                              height={500}
                              className="object-contain w-full h-auto max-h-[300px] relative z-10"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={handleDownload}
                          size="lg"
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Download className="h-5 w-5 mr-2" />
                          Download PNG
                        </Button>

                        <Button variant="outline" onClick={handleReset} size="lg">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Process Another Image
                        </Button>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                              Image processed successfully!
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                              Your image has been saved to your history and is ready for download.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Info Sidebar - Takes up 1 column */}
        <div className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="h-5 w-5 text-purple-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Upload Image</p>
                    <p className="text-xs text-muted-foreground">Choose any JPG, PNG, or WEBP file</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Processing</p>
                    <p className="text-xs text-muted-foreground">Our AI detects and removes the background</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Download Result</p>
                    <p className="text-xs text-muted-foreground">Get your transparent PNG instantly</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">AI-powered precision</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Instant processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">High-quality results</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Transparent PNG output</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Free to use</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Best Results Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Use high-contrast images</p>
                <p>• Ensure clear subject boundaries</p>
                <p>• Avoid complex backgrounds</p>
                <p>• Higher resolution = better results</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* History Section */}
      {session?.user && (
        <div className="space-y-6">
          <BgRemovedHistory images={history} loading={historyLoading} />
        </div>
      )}

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="pt-6">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
            <p className="text-muted-foreground text-sm">
              Our advanced AI precisely detects and removes backgrounds with exceptional accuracy.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="pt-6">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground text-sm">
              Get results in seconds, not minutes. Perfect for quick edits and professional work.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30">
          <CardContent className="pt-6">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 w-12 h-12 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">100% Free</h3>
            <p className="text-muted-foreground text-sm">
              No hidden fees or watermarks. <strong>Sign up required, still free!</strong>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Ad Block */}
      <div className="rounded-lg overflow-hidden shadow-sm">
        <AdBlock adSlot="8397118667" className="w-full" />
      </div>
    </div>
  )
}
