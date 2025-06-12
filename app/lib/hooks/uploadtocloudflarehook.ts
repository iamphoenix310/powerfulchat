'use client'
import { useState } from 'react'

interface R2FileMeta {
  url: string
  name: string
  size: number
  type: string
  uploadedAt: string
}

export function useR2SignedUpload() {
  const [progress, setProgress] = useState(0)

  const upload = async (file: File): Promise<R2FileMeta> => {
    // Step 1: Get signed URL
    const presignRes = await fetch('/api/r2-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file.name,
        filetype: file.type, // ✅ must be EXACTLY this in your PUT
      }),
    })

    const { signedUrl, publicUrl } = await presignRes.json()

    // Step 2: Upload via PUT
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100)
          setProgress(percent)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve({
            url: publicUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadedAt: new Date().toISOString(),
          })
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))

      xhr.open('PUT', signedUrl)
      xhr.setRequestHeader('Content-Type', file.type) // ✅ MUST MATCH signed request
      xhr.send(file)
    })
  }

  return { upload, progress }
}
