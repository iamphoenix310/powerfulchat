'use client'

import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/app/utils/sanityClient'

interface SanityImageAsset {
  asset: {
    _ref: string
    _type: 'reference'
  }
}

interface MasonryGalleryProps {
  images: {
    _id: string
    image?: SanityImageAsset // narrow for safety
    prompt: string
    aspectRatio?: string
    status:string
  }[]
}


const MasonryGallery: React.FC<MasonryGalleryProps> = ({ images = [] }) => {
  // ✅ Only keep images that have a valid Sanity image object
  const validImages = images.filter((img) => img.image?.asset?._ref)

  if (!validImages.length) {
    return (
      <p className="text-gray-500 text-sm">
        No images yet. Start generating something!
      </p>
    )
  }

  return (
    
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
  {validImages.map((img, idx) => (
    <div
      key={img._id || idx}
      className="flex flex-col md:flex-row items-start gap-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200"
    >
      <Image
        src={urlFor(img.image, { width: 600 })}
        alt={img.prompt || `Generated Image ${idx + 1}`}
        width={400}
        height={600}
        className="rounded-xl object-cover w-full max-w-[250px]"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-black text-sm mb-2"><strong>Prompt:</strong> {img.prompt}</p>
          {img.aspectRatio && (
            <p className="text-gray-600 text-sm mb-4"><strong>Aspect Ratio:</strong> {img.aspectRatio}</p>
          )}
        </div>
              {img.status === 'published' ? (
        <span className="inline-block bg-green-100 text-green-700 px-6 py-3 rounded-xl font-semibold cursor-default">
          ✅ Published
        </span>
      ) : (
        <Link href={`/publish/${img._id}`} passHref>
          <span className="inline-block bg-gradient-to-br from-gray-100 to-gray-300 text-black font-semibold px-6 py-3 rounded-xl hover:shadow-lg transition">
            🚀 Publish This Image
          </span>
        </Link>
      )}

      </div>
    </div>
  ))}
</div>

  )
}

export default MasonryGallery
