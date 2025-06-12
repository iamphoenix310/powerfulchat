'use client'

import { useState } from 'react'
import { client, urlFor } from '@/app/utils/sanityClient'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'

export default function UpdateProfileImage() {
  const { data: session } = useSession()
  const [showUploader, setShowUploader] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploading(true)
    setSuccess(false)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    try {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
      })

      await client
        .patch(session.user.id)
        .set({ profileImage: { asset: { _ref: asset._id, _type: 'reference' } } })
        .commit()

      setSuccess(true)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-8 text-center">
      {!showUploader ? (
        <button
          onClick={() => setShowUploader(true)}
          className="text-blue-500 hover:text-blue-700 font-medium text-base transition-all duration-300"
        >
          Change Profile Picture
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl"
          >
            <h2 className="text-xl font-semibold text-black mb-2">Update Profile</h2>
            <p className="text-sm text-black-300 mb-4">Upload a new image for your profile</p>

            <div className="flex justify-center mb-4">
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  width={100}
                  height={100}
                  className="rounded-full object-cover border border-black/30"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-black-400 text-sm">
                  No Preview
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <label className="relative inline-block px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white text-sm font-medium rounded-full transition-all duration-300 cursor-pointer">
                {uploading ? 'Uploading...' : 'Choose Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </label>

              {success && (
                <span className="text-green-400 text-sm mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Uploaded
                </span>
              )}
            </div>

            <button
              onClick={() => setShowUploader(false)}
              className="mt-4 text-sm text-gray-400 hover:text-gray-200 underline"
            >
              Cancel
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
