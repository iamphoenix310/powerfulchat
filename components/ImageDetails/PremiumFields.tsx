"use client"

import type React from "react"
import { useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileIcon, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface PremiumFieldsProps {
  isPremium: boolean
  setIsPremium: (v: boolean) => void
  price: string
  setPrice: (v: string) => void
  attachedFiles: File[]
  setAttachedFiles: (files: File[]) => void
  unlockAfterPurchase: boolean
  setUnlockAfterPurchase: (v: boolean) => void
}

const PremiumFields: React.FC<PremiumFieldsProps> = ({
  isPremium,
  setIsPremium,
  price,
  setPrice,
  attachedFiles,
  setAttachedFiles,
  unlockAfterPurchase,
  setUnlockAfterPurchase,
}) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf", "application/zip"]
      const filesArray = Array.from(e.target.files)
      const filtered = filesArray.filter((file) => validTypes.includes(file.type))

      if (filtered.length !== filesArray.length) {
        alert("Some files were skipped because they are not supported formats.")
      }

      setAttachedFiles(filtered)
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index))
  }

  // Reset everything when premium is turned off
  useEffect(() => {
    if (!isPremium) {
      setPrice("")
      setAttachedFiles([])
      setUnlockAfterPurchase(true)
    }
  }, [isPremium, setPrice, setAttachedFiles, setUnlockAfterPurchase])

  const getFileTypeColor = (type: string) => {
    if (type.includes("pdf")) return "bg-red-100 text-red-700 border-red-200"
    if (type.includes("zip")) return "bg-purple-100 text-purple-700 border-purple-200"
    if (type.includes("image")) return "bg-green-100 text-green-700 border-green-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getFileIcon = (type: string) => {
    return <FileIcon className="h-4 w-4 mr-1.5" />
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox id="premium" checked={isPremium} onCheckedChange={() => setIsPremium(!isPremium)} />
        <Label
          htmlFor="premium"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
        >
          Make this a Premium Upload
        </Label>
      </div>

      {isPremium && (
        <Card className="border border-gray-200 dark:border-gray-800">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Price (INR)
              </Label>
              <Input
                id="price"
                type="number"
                min={1}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 99"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="files" className="text-sm font-medium">
                Upload Files (.zip or .pdf)
              </Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="files"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">ZIP, PDF, JPG, PNG, WEBP (MAX. 10MB)</p>
                  </div>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept=".zip,.pdf,image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="unlock"
                checked={unlockAfterPurchase}
                onCheckedChange={() => setUnlockAfterPurchase(!unlockAfterPurchase)}
              />
              <Label
                htmlFor="unlock"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Unlock files only after payment
              </Label>
            </div>

            {isPremium && attachedFiles.length === 0 && (
                <p className="text-sm text-red-600">
                  ⚠️ Required: Upload a ZIP, PDF, or the same image file to deliver after payment.
                </p>
              )}

            {attachedFiles.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Attached Files</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                  {attachedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-center overflow-hidden">
                        {getFileIcon(file.type)}
                        <Badge variant="outline" className={cn("mr-2", getFileTypeColor(file.type))}>
                          {file.type.split("/")[1].toUpperCase()}
                        </Badge>
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Remove file</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PremiumFields
