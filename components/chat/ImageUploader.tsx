'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Plus } from "lucide-react"
import React, { useRef } from "react"

interface ImageUploaderProps {
  value: File[]
  onChange: (files: File[]) => void
  maxFiles?: number
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  maxFiles = 6,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const newFiles = Array.from(files)
    const merged = [...value, ...newFiles].slice(0, maxFiles)
    onChange(merged)
  }

  const removeFile = (index: number) => {
    const newFiles = value.filter((_, i) => i !== index)
    onChange(newFiles)
  }

  return (
    <div className="px-4 pt-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((file, idx) => (
            <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden">
              <img
                src={URL.createObjectURL(file)}
                alt={`upload-${idx}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="absolute top-0 right-0 text-white bg-black bg-opacity-50 text-xs px-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        multiple
        hidden
        ref={inputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/70 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="text-xs">
          Add photos and files
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
