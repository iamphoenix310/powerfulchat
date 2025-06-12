"use client"

import type React from "react"

import { useR2SignedUpload } from "@/app/lib/hooks/uploadtocloudflarehook"
import { client } from "@/app/utils/sanityClient"
import { LoginModal } from "@/components/GoogleLogin/LoginModel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Crown, ImageIcon, Loader2, Tag, Upload, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
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

export default function ProductUploadForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [category, setCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [productImageFiles, setProductImageFiles] = useState<File[]>([])
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isPremium, setIsPremium] = useState(false)
  const [unlockAfterPurchase, setUnlockAfterPurchase] = useState(true)
  const [price, setPrice] = useState("")
  const [freeWithSubscription, setFreeWithSubscription] = useState(false)

  const { data: session } = useSession()
  const router = useRouter()
  const { upload: uploadWithProgress, progress } = useR2SignedUpload()

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await client.fetch(`*[_type == "productcategory"]{_id, name}`)
      setCategories(result)
    }
    fetchCategories()
  }, [])

  async function uploadFileToSanity(file: File): Promise<any> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/products/sanity-upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) throw new Error("Sanity image upload failed")
    const data = await res.json()
    if (!data.assetId) throw new Error("No assetId returned")

    return {
      _type: "image",
      _key: uuidv4(),
      asset: {
        _type: "reference",
        _ref: data.assetId,
      },
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return toast.error("Please login to upload.")
    if (!title.trim()) return toast.error("Title is required.")
    if (isPremium && attachedFiles.length === 0) {
      toast.error("Upload at least one file for premium product.")
      return
    }

    setIsUploading(true)

    const r2FilesMeta: R2FileMeta[] = []
    const uploadedSanityImages: any[] = []
    let finalMainImage = null

    try {
      for (const file of productImageFiles) {
        const img = await uploadFileToSanity(file)
        uploadedSanityImages.push({
          ...img,
          _key: uuidv4(),
        })
      }

      if (mainImageFile) {
        const main = await uploadFileToSanity(mainImageFile)
        finalMainImage = {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: main.asset._ref,
          },
          _key: uuidv4(),
        }
      } else if (uploadedSanityImages.length > 0) {
        finalMainImage = uploadedSanityImages[0]
      }

      if (!finalMainImage || !finalMainImage.asset) {
        toast.error("Main image is required.")
        setIsUploading(false)
        return
      }

      for (const file of attachedFiles) {
        const result = await uploadWithProgress(file)
        r2FilesMeta.push({
          _key: uuidv4(),
          ...(result as Omit<R2FileMeta, "_key" | "uploadedAt">),
          uploadedAt: new Date().toISOString(),
        })
      }

      const res = await fetch("/api/products/upload-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()),
          category,
          isPremium,
          price: Number.parseFloat(price || "0"),
          unlockAfterPurchase,
          freeWithSubscription,
          attachedFiles: r2FilesMeta,
          productImages: uploadedSanityImages,
          mainimage: finalMainImage,
          creator: session?.user?.email || "",
        }),
      })

      const data = await res.json()
      if (!data.slug) throw new Error("Invalid response from server")

      toast.success("Product uploaded successfully! 🎉")
      router.push(`/products/${data.slug}`)
    } catch (err) {
      console.error("Upload failed", err)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const role = (session?.user as any)?.role

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Please login to upload products</p>
            <LoginModal onClose={() => {}} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Admin Access Only</h2>
            <p className="text-gray-600 dark:text-gray-400">You need admin privileges to upload products</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Upload New Product</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and publish a new product for your store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Product Title *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter product title..."
                  required
                  className="text-lg border-2 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your product..."
                  rows={4}
                  className="border-2 focus:border-blue-400 dark:focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="tag1, tag2, tag3..."
                    className="border-2 focus:border-blue-400 dark:focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Separate tags with commas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="border-2 focus:border-blue-400 dark:focus:border-blue-500">
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
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="main-image" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Main Image *
                </Label>
                <Input
                  id="main-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && setMainImageFile(e.target.files[0])}
                  className="border-2 focus:border-green-400 dark:focus:border-green-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will be the primary image for your product
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview-images" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Additional Images
                </Label>
                <Input
                  id="preview-images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setProductImageFiles(Array.from(e.target.files || []))}
                  className="border-2 focus:border-green-400 dark:focus:border-green-500"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload multiple images to showcase your product
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Settings */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Subscription Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <Checkbox
                  id="free-subscription"
                  checked={freeWithSubscription}
                  onChange={(e) => setFreeWithSubscription((e.target as HTMLInputElement).checked)}
                  className="data-[state=checked]:bg-purple-500"
                />
                <div>
                  <Label
                    htmlFor="free-subscription"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
                  >
                    Free for Subscribers
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Allow subscribers to access this product for free
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Settings */}
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

          {/* Submit Button */}
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <Button
                type="submit"
                disabled={isUploading}
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" />
                    Uploading Product...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-5 w-5" />
                    Upload Product
                  </>
                )}
              </Button>

              {progress > 0 && progress < 100 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>Uploading files...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-3" />
                </div>
              )}
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
