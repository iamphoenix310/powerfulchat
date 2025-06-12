// app/tools/upscale/page.tsx
import type { Metadata } from 'next'
import UpscaleTool from '@/components/Tools/UpscaleTool/UpscaleTool'

export const metadata: Metadata = {
  title: 'AI Image Upscaler – Enhance Your Photos with Real-ESRGAN',
  description:
    'Upload and upscale your images using AI-powered Real-ESRGAN. Get high-resolution, sharp, and stunning results instantly with 2x or 4x enhancement.',
  openGraph: {
    title: 'AI Image Upscaler – Enhance Your Photos with Real-ESRGAN',
    description:
      'Powerful AI tool for upscaling images up to 4x. Perfect for portraits, art, and low-resolution photos. 100% free and fast.',
    url: 'https://visitpowerful.com/tools/upscale',
    images: [
      {
        url: 'https://visitpowerful.com/og/upscale-tool.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Image Upscaler',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Upscaler – Enhance Your Photos with Real-ESRGAN',
    description:
      'AI upscaling for images. Make your photos HD and stunning using cutting-edge Real-ESRGAN. Try it free now.',
    images: ['https://visitpowerful.com/og/upscale-tool.jpg'],
  },
}

export default function UpscalePage() {
  return (
    <div className="min-h-screen py-10 px-4 max-w-5xl mx-auto">
      <UpscaleTool />
    </div>
  )
}
