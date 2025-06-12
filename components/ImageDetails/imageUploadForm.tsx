"use client"

import { useR2SignedUpload } from "@/app/lib/hooks/uploadtocloudflarehook"
import { uploadImageToSanity } from "@/app/lib/sanity/imageActions"
import { client } from "@/app/utils/sanityClient"
import { LoginModal } from "@/components/GoogleLogin/LoginModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ImageIcon, Loader2, Sparkles, Upload, X } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"; // ✅ make sure this is at the top if not already
import { v4 as uuidv4 } from "uuid"
import PremiumFields from "./PremiumFields"

interface Category {
  _id: string
  name: string
}

interface R2FileMeta {
  _key: string
  url: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

interface InitialValues {
  imageUrl?: string
  title?: string
  description?: string
  tags?: string[]
  altText?: string
  generatedImageId?: string
  prompt?: string
}

interface ImageUploadFormProps {
  onSubmit?: (data: {
    title: string
    description: string
    tags: string[]
  }) => void
  initialValues?: InitialValues
}

const ImageUploadForm: React.FC<ImageUploadFormProps> = ({ onSubmit, initialValues }) => {
  const [image, setImage] = useState<File | null>(null)
  const [title, setTitle] = useState(initialValues?.title || "")
  const [description, setDescription] = useState(initialValues?.description || "")
  const [altText, setAltText] = useState(initialValues?.altText || "")
  const [tags, setTags] = useState((initialValues?.tags || []).join(", "))
  const [prompt, setPrompt] = useState(initialValues?.prompt || "")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false)
  const [userDescription, setUserDescription] = useState("")

  const [isPremium, setIsPremium] = useState(false)
  const [unlockAfterPurchase, setUnlockAfterPurchase] = useState(true)
  const [price, setPrice] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const router = useRouter()
  const { data: session } = useSession()
  const { upload: uploadWithProgress, progress } = useR2SignedUpload()

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await client.fetch(`*[_type == "category"]{_id, name}`)
      setCategories(result)
    }

    fetchCategories()
  }, [])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImage(file)

      // Preview the image instantly
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)
    }
  }

  const handleGenerateMetadataFromDescription = async () => {
    if (!userDescription.trim()) {
      alert("Please write a little about the image first.")
      return
    }

    try {
      setIsGeneratingMetadata(true)

      const res = await fetch("/api/generate-metadata-openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: userDescription }),
      })

      const data = await res.json()

      setTitle(data.title || "")
      setDescription(data.description || "")
      setTags(data.tags?.join(", ") || "")
      setAltText(data.altText || "")
      setPrompt(data.prompt || "")
    } catch (error) {
      console.error("Failed to generate metadata from description:", error)
      alert("Metadata generation failed. Please try again.")
    } finally {
      setIsGeneratingMetadata(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isPremium && attachedFiles.length === 0) {
      toast.error(
        "To mark this as a Premium image, please upload a ZIP, PDF, or the same image file for users to download after payment.",
        { duration: 6000 }
      )
      document.getElementById("files")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    if (!session) return setShowLoginModal(true)
    if ((!image && !initialValues?.imageUrl) || !title.trim()) {
      alert("Image and title are required!")
      return
    }

    const formData = new FormData()

    // Main image
    if (image) formData.append("image", image)
    if (initialValues?.imageUrl) formData.append("imageUrl", initialValues.imageUrl)

    // Metadata
    formData.append("title", title.trim())
    formData.append("description", description.trim())
    formData.append("tags", tags)
    formData.append("altText", altText.trim())
    formData.append("category", category)
    formData.append("creator", session?.user?.email || "")

    if (initialValues?.generatedImageId) {
      formData.append("generatedImageId", initialValues.generatedImageId)
    }
    if (prompt) {
      formData.append("prompt", prompt)
    }

    formData.append("isPremium", isPremium.toString())
    formData.append("price", isPremium ? price || "0" : "0")
    formData.append("unlockAfterPurchase", unlockAfterPurchase.toString())

    formData.append("attachedCount", attachedFiles.length.toString())
    const r2FilesMeta: R2FileMeta[] = []

    for (let i = 0; i < attachedFiles.length; i++) {
      const file = attachedFiles[i]
      try {
        const result = (await uploadWithProgress(file)) as Omit<R2FileMeta, "_key" | "uploadedAt">
        r2FilesMeta.push({
          _key: uuidv4(),
          ...result,
          uploadedAt: new Date().toISOString(),
        })
      } catch (err) {
        console.error("❌ File upload failed", err)
        alert("File upload failed. Please try again.")
        return
      }
    }
    formData.append("attachedFiles", JSON.stringify(r2FilesMeta))

    try {
      setIsUploading(true)
      const result = await uploadImageToSanity(formData)
      if (!result) {
        alert("Server returned nothing. Possible Sanity upload failure or auth issue.")
        setIsUploading(false)
        return
      }

      if (!result || !result.slug) {
        console.error("Upload failed: Invalid response from server", result)
        alert("Upload failed. Please try again.")
        setIsUploading(false)
        return
      }
      router.push(`/images/${result.slug}`)
      setImage(null)
    } catch (err) {
      console.error("Upload failed", err)
      alert("Something went wrong. Please try again.")
      setIsUploading(false)
    }
  }

  return (
    <>
      {!session && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        {/* Image Upload */}
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Upload Image</Label>
                {previewUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImage(null)
                      setPreviewUrl(null)
                      setTitle("")
                      setDescription("")
                      setTags("")
                      setAltText("")
                      setPrompt("")
                    }}
                    className="h-8 text-xs"
                  >
                    <X className="mr-1 h-3 w-3" /> Clear
                  </Button>
                )}
              </div>

              {previewUrl ? (
                <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Image
                      src={previewUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[300px] max-w-full object-contain"
                    />
                  </div>

                  {isGeneratingMetadata && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-black/50 rounded text-white text-sm font-medium z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Generating metadata...</span>
                      </div>
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                    </div>
                  )}
                </div>
              ) : initialValues?.imageUrl ? (
                <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <Image
                    src={initialValues.imageUrl || "/placeholder.svg"}
                    alt="Generated"
                    width={1024}
                    height={
                      initialValues.imageUrl.includes("1024x1536")
                        ? 1536
                        : initialValues.imageUrl.includes("1536x1024")
                        ? 1024
                        : 1024
                    }
                    className="max-h-[300px] w-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Description */}
        <div className="space-y-2">
          <Label htmlFor="user-description" className="text-sm font-medium">
            Tell us about the image
          </Label>
          <Textarea
            id="user-description"
            value={userDescription}
            onChange={(e) => setUserDescription(e.target.value)}
            placeholder="e.g., A majestic lion standing on a cliff at sunset."
            className="min-h-[80px]"
          />
          {userDescription && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isGeneratingMetadata}
              onClick={handleGenerateMetadataFromDescription}
              className="mt-2"
            >
              {isGeneratingMetadata ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Auto Generate Metadata
                </>
              )}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your image"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide a detailed description of your image"
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. nature, landscape, sunset"
            />
          </div>

          {/* Alt Text */}
          <div className="space-y-2">
            <Label htmlFor="alt-text" className="text-sm font-medium">
              Alt Text
            </Label>
            <Input
              id="alt-text"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </div>

        {/* Prompt */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </Label>
            <span className="text-xs text-gray-500">(optional, AI-generated)</span>
          </div>
          <Input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. 'A surreal landscape with futuristic buildings and golden hour lighting'"
          />
        </div>

        {/* Premium Fields */}
        <PremiumFields
          isPremium={isPremium}
          setIsPremium={setIsPremium}
          price={price}
          setPrice={setPrice}
          attachedFiles={attachedFiles}
          setAttachedFiles={setAttachedFiles}
          unlockAfterPurchase={unlockAfterPurchase}
          setUnlockAfterPurchase={setUnlockAfterPurchase}
        />

        {/* Upload Button */}
        <Button type="submit" disabled={isUploading} className="w-full h-12 text-base font-medium" size="lg">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" /> Upload Image
            </>
          )}
        </Button>

        {progress > 0 && progress < 100 && (
          <div className="w-full space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Uploading files...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {isUploading && (
          <div className="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-4 py-3 rounded-lg text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading your image to our servers...</span>
          </div>
        )}
      </form>
    </>
  )
}

export default ImageUploadForm
