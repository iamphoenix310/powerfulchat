'use client'

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { Smartphone } from 'lucide-react'
import { useMusicPlayer } from '@/components/Music/Playing/MusicPlayerContext'


export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isIOSDevice, setIsIOSDevice] = useState(false)
  const [isBannerVisible, setIsBannerVisible] = useState(false)
  const { currentTrack } = useMusicPlayer()

  useEffect(() => {
    if (currentTrack) {
      setIsBannerVisible(false)
    }
  }, [currentTrack])
  

  const isIOS = () => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    return /iphone|ipad|ipod/.test(userAgent)
  }

  const isInStandaloneMode = () =>
    'standalone' in window.navigator && (window.navigator as any).standalone

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    const hasInstalled = localStorage.getItem('pwa-installed') === 'true'

    if (isIOS() && !isInStandaloneMode() && !hasInstalled) {
      setIsIOSDevice(true)
      setIsInstallable(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === 'accepted') {
        toast.success('App installed successfully!')
        localStorage.setItem('pwa-installed', 'true')
        setIsInstallable(false)
        setIsBannerVisible(false)
      } else {
        toast('Installation dismissed')
      }
      setDeferredPrompt(null)
    }
  }

  if (!isInstallable) return null

  return (
    <>
      {/* 🌟 Mini Install Button */}
      {!isBannerVisible && (
        <button
          onClick={() => setIsBannerVisible(true)}
          className="fixed bottom-20 right-6 z-[60] p-3 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition"
        >
          <Smartphone size={20} />
        </button>
      )}

      {/* 🚀 Full Install Banner */}
      {isBannerVisible && (
        <div className="fixed bottom-24 left-4 right-4 z-[60] bg-white shadow-lg border border-gray-300 rounded-xl px-4 py-3 flex items-center justify-between space-x-4 max-w-md mx-auto">
          {isIOSDevice ? (
            <div className="text-sm text-gray-800">
              <div className="font-semibold">Install this app</div>
              <div className="text-xs">
                Tap <span className="font-bold">Share</span> then - 
                <span className="font-bold">Add to Home Screen</span>
              </div>
              <div className="relative mt-2 w-full" style={{ aspectRatio: '2.25 / 1' }}>
                <Image
                  src="/ios-install.jpg"
                  alt="iOS Install Instructions"
                  fill
                  className="object-contain rounded-md"
                  priority
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-800">
              <div className="font-semibold">Install Powerful on your device</div>
              <div className="text-xs text-gray-500">Quick access and offline support</div>
            </div>
          )}

          {!isIOSDevice && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800"
            >
              Install
            </button>
          )}

          {/* ❌ Close button */}
          <button
            onClick={() => setIsBannerVisible(false)}
            className="text-gray-500 text-sm hover:text-black ml-2"
          >
            ×
          </button>
        </div>
      )}
    </>
  )
}
