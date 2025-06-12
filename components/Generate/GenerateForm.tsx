'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'
import { LoginModal } from '@/components/GoogleLogin/LoginModel'
import { urlFor } from '@/app/utils/sanityClient'
import { useGeneratedImages } from '@/app/lib/hooks/userGeneratedImages'
import MasonryGallery from '@/components/Generate/MasonaryGallery'


interface Props {
  remainingCount: number
}

interface GalleryImage {
  _id: string
  image?: {
    asset: {
      _ref: string
      _type: 'reference'
    }
  }
  prompt: string
  aspectRatio?: string
  status: string
}

const ASPECT_RATIOS = [
  '1:1', '16:9', '3:2', '2:3',
  '4:5', '5:4', '9:16', '3:4', '4:3'
]

export default function GenerateClientForm() {

   const [prompt, setPrompt] = useState('')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  // Explicitly type as boolean
  const [optimizePrompt, setOptimizePrompt] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState<'flux' | 'imagen' | 'imagen-ghibli'>('flux')
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [remainingCount, setRemainingCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchRemaining = async () => {
      try {
        const res = await fetch('/api/generate/count')
        const data = await res.json()
        setRemainingCount(data.remaining)
      } catch (err) {
        console.error('Failed to fetch remaining count', err)
        setRemainingCount(0) // fallback
      }
    }
  
    fetchRemaining()
  }, [])

  const models = [
    {
      key: 'flux',
      name: 'Power Pro',
      description: 'High-res, ultra-detailed renders',
    },
    {
      key: 'imagen',
      name: 'Power Air',
      description: 'Fast, clean, creative output',
    },
    {
      key: 'imagen-ghibli',
      name: 'Power Ghibli',
      description: 'Animated, magical, Ghibli-style art',
    },
  ]



  const { 
    images: generatedImages = [], 
    isLoading: loadingImages, 
    mutate 
  } = useGeneratedImages()


  
  // Rename variables to avoid duplicates
  const latestImage = generatedImages.length > 0 ? generatedImages[0] : null
  const remainingImages = generatedImages.slice(1)

  // Now safely filter remainingImages to only include valid GalleryImage items
  const validGalleryImages: GalleryImage[] = remainingImages.filter(
    (img): img is GalleryImage => {
      const asset = (img?.image as any)?.asset
      return typeof asset === 'object' && typeof asset._ref === 'string'
    }
  )
  
  const { data: session } = useSession()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Prompt is required')
      return
    }

    try {
      setIsLoading(true)
      

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          prompt_upsampling: optimizePrompt,
          model: selectedModel,
        }),
      })

      const data = await res.json()


      if (!res.ok || !data?.image || !data?._id) {
        toast.error(data.error || 'Image generation failed')
        return
      }
      // ✅ Update remainingCount from response
    setRemainingCount(data.remaining)
      // Show toast with remaining counter
      if (data.remaining === 0) {
        toast.success(`🎉 Image generated! You’ve used all 75 images for today.`)
      } else {
        toast.success(`✅ Image generated! You have ${data.remaining} left today.`)
      }

      const safeImages = Array.isArray(generatedImages) ? generatedImages : []

      const newImage = {
        _id: data._id,
        image: data.image, // use the actual image reference
        prompt,
        aspectRatio,
        promptOptimized: optimizePrompt,
      }

      mutate({ images: [newImage, ...safeImages] }, false)

      toast.success('Image generated!')
      setPrompt('')
    } catch (err: any) {
      console.error('[GenerateForm Error]', err)
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
    {!session && <LoginModal onClose={() => setShowLoginModal(false)} />}
    
    <div className="w-full max-w-6xl mx-auto px-4 pb-24">
      <div className="bg-gradient-to-br from-[#0f0f0f] to-[#1c1c1c] p-6 rounded-xl shadow-xl border border-gray-700/40 backdrop-blur-md">
      <div className="mb-6 text-sm sm:text-base text-gray-300 bg-black/30 border border-gray-600 rounded-lg px-4 py-3 shadow-inner">
          <p className="font-medium text-white">👋 Welcome!</p>
          <p className="mt-1">
            You can generate <span className="font-semibold text-indigo-400">5 images daily for free</span>.  
            More powerful features are coming soon — stay tuned! 🚀
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6 tracking-tight">
          Generate Stunning AI Art
        </h2>

        <div className="space-y-5 text-sm">
          <div className="relative">
            <textarea
              placeholder="Describe your image idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = 'auto'
                el.style.height = `${el.scrollHeight}px`
              }}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  handleGenerate()
                }
              }}
              rows={3}
              className="w-full bg-black/40 border border-gray-600 rounded-md px-4 py-2 text-base text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all overflow-hidden"

            />
            <div className="absolute bottom-1 right-2 text-xs text-gray-400">
              {prompt.length} characters
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <label className="text-gray-400 font-medium mb-1">Aspect Ratio</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="bg-black/50 text-white text-base border border-gray-600 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >

                {ASPECT_RATIOS.map((ratio) => (
                  <option key={ratio} value={ratio}>{ratio}</option>
                ))}
              </select>
            </div>
          </div>
          
                    <div className="space-y-2">
            <label className="text-gray-400 font-medium">Choose a Model</label>
            <div className="grid sm:grid-cols-3 gap-4">
              {models.map((model) => (
                <button
                  key={model.key}
                  onClick={() => setSelectedModel(model.key as any)}
                  type="button"
                  className={`
                    p-4 rounded-lg border transition-all duration-200 text-left
                    ${selectedModel === model.key
                      ? 'border-indigo-500 bg-black/30 ring-2 ring-indigo-500'
                      : 'border-gray-700 hover:border-gray-500 bg-black/10'}
                  `}
                >
                  <div className="text-white font-semibold text-base">{model.name}</div>
                  <div className="text-gray-400 text-sm mt-1">{model.description}</div>
                </button>
              ))}
            </div>
          </div>


          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-md transition-all duration-200 shadow-md hover:shadow-indigo-400/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : '✨ Generate'}
          </button>
         {/* remaining counter comes here */}
         {remainingCount !== null && (
        <p className={`text-sm text-center ${remainingCount === 0 ? 'text-red-500' : 'text-gray-400'}`}>
          🧠 You have <span className="text-white font-semibold">{remainingCount}</span> image generations left today.
        </p>
      )}

         
        </div>
      </div>

   
{latestImage && (
  <div className="mt-12">
    <h3 className="text-2xl font-semibold text-black mb-6">✨ Your Latest Creation</h3>
    <div className="flex flex-col md:flex-row items-start gap-6 bg-white rounded-xl shadow-xl p-4 border border-gray-300">
      <Image
        src={urlFor(latestImage.image)}
        alt={latestImage.prompt || 'Generated Image'}
        width={400}
        height={600}
        className="rounded-xl object-cover w-full max-w-md"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-black text-sm mb-2"><strong>Prompt:</strong> {latestImage.prompt}</p>
          {latestImage.aspectRatio && (
            <p className="text-gray-600 text-sm mb-4"><strong>Aspect Ratio:</strong> {latestImage.aspectRatio}</p>
          )}
        </div>
        {latestImage.status === 'published' ? (
        <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold cursor-default">
          ✅ Published
        </span>
      ) : (
        <Link href={`/publish/${latestImage._id}`} passHref>
          <span className="inline-block bg-gradient-to-br from-gray-100 to-gray-300 text-black font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition">
            🚀 Publish This Image
          </span>
        </Link>
      )}

      </div>
    </div>
  </div>
)}

<div className="mt-16">
  <h3 className="text-2xl font-semibold text-black mb-6">✨ Your Previous Creations</h3>
  {loadingImages ? (
    <p className="text-black-400 text-sm">Loading images...</p>
  ) : (
    <MasonryGallery images={validGalleryImages} />
  )}
</div>
</div>
</>
)}

