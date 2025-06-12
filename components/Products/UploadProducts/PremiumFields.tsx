"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { AlertCircle, Crown, FileIcon, Upload, X } from 'lucide-react'
import type React from "react"
import { useEffect } from "react"

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
    if (type.includes("pdf")) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800"
    if (type.includes("zip")) return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-800"
    if (type.includes("image")) return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800"
    return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
  }

  const getFileIcon = (type: string) => {
    return <FileIcon className="h-4 w-4 mr-1.5" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <Checkbox 
          id="premium" 
          checked={isPremium} 
          onCheckedChange={() => setIsPremium(!isPremium)}
          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-500 data-[state=checked]:to-orange-500"
        />
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <Label
            htmlFor="premium"
            className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer"
          >
            Make this a Premium Product
          </Label>
        </div>
      </div>

      {isPremium && (
        <Card className="border-2 border-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-800 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              Premium Product Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Price Input */}
            <div className="space-y-3">
              <Label htmlFor="price" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Price (INR) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">₹</span>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  step={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="99"
                  className="pl-8 text-lg font-semibold border-2 focus:border-yellow-400 dark:focus:border-yellow-500"
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-3">
              <Label htmlFor="files" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Upload Premium Files *
              </Label>
              <div className="relative">
                <label
                  htmlFor="files"
                  className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">ZIP, PDF, JPG, PNG, WEBP (MAX. 10MB)</p>
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

            {/* Unlock Settings */}
            <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <Checkbox
                id="unlock"
                checked={unlockAfterPurchase}
                onCheckedChange={() => setUnlockAfterPurchase(!unlockAfterPurchase)}
                className="data-[state=checked]:bg-blue-500"
              />
              <Label
                htmlFor="unlock"
                className="text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer"
              >
                Require payment before file access
              </Label>
            </div>

            {/* Warning for missing files */}
            {isPremium && attachedFiles.length === 0 && (
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                  Premium products require at least one file to be uploaded for delivery after payment.
                </AlertDescription>
              </Alert>
            )}

            {/* Attached Files Display */}
            {attachedFiles.length > 0 && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Attached Files ({attachedFiles.length})
                </Label>
                <Card className="border border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {attachedFiles.map((file, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center overflow-hidden flex-1 mr-3">
                            <div className="flex-shrink-0 mr-3">
                              {getFileIcon(file.type)}
                            </div>
                            <Badge variant="outline" className={cn("mr-3 flex-shrink-0", getFileTypeColor(file.type))}>
                              {file.type.split("/")[1].toUpperCase()}
                            </Badge>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(i)}
                            className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove file</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PremiumFields
