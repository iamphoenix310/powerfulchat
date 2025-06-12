'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Loader2, UploadCloud, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const UPSCALE_ENDPOINT = 'https://powerful--real-esrgan-fastapi-cloned-fastapi-app.modal.run/upscale/'

export default function UpscaleTool() {
  const [file, setFile] = useState<File | null>(null)
  const [output, setOutput] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [scale, setScale] = useState(4)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)
    setOutput(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch(`${UPSCALE_ENDPOINT}?scale=${scale}`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Upscaling failed')

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setOutput(imageUrl)
    } catch (err) {
      alert('Failed to upscale image')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Image Upscaler (Real-ESRGAN)</h1>

      <Card className="mb-6">
        <CardContent className="p-4 space-y-4">
          <Label htmlFor="upload">Choose Image</Label>
          <Input
            id="upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />

          <Label htmlFor="scale">Upscale Factor</Label>
          <select
            id="scale"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
            className="border rounded px-3 py-1"
          >
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>

          <Button onClick={handleUpload} disabled={loading || !file} className="w-full">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <UploadCloud className="mr-2" />}
            Upscale
          </Button>
        </CardContent>
      </Card>

      {output && (
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2">Upscaled Result</h2>
          <Image src={output} alt="Upscaled" width={512} height={512} className="rounded shadow" />
          <a
            href={output}
            download="upscaled.png"
            className="inline-block mt-4 text-blue-600 underline"
          >
            Download Image
          </a>
        </div>
      )}
    </div>
  )
}
