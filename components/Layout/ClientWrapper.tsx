'use client'

import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer/Footer'
import GlobalMusicBar from '@/components/Music/Playing/GlobalMusicBar'
import ClientOnlyBottomBar from '@/components/ImageDetails/clientOnlyBottomBar'
import PWAInstallPrompt from '@/components/Shared/PwaInstall'

interface Props {
  children: React.ReactNode
}

export default function ClientWrapper({ children }: Props) {
  const pathname = usePathname()
  const hideFooter = pathname?.startsWith('/chat')

  return (
    <>
      {children}
      {!hideFooter && (
        <>
          <PWAInstallPrompt />
          <Footer />
          <GlobalMusicBar />
          <ClientOnlyBottomBar />
        </>
      )}
    </>
  )
}
