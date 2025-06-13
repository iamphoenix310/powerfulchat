'use client'

import AppSidebar from '@/components/app-sidebar'
import ArtifactRoot from '@/components/artifact/artifact-root'
import Header from '@/components/header'
import GlobalMusicBar from '@/components/Music/Playing/GlobalMusicBar'
import { MusicPlayerProvider } from '@/components/Music/Playing/MusicPlayerContext'
import { ThemeProvider } from '@/components/theme-provider'
import { SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { Analytics } from '@vercel/analytics/next'
import { Inter as FontSans } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { Providers } from './providers'


const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

export default function BodyWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isChatLike = pathname?.startsWith('/chat') || pathname?.startsWith('/search') || pathname?.startsWith('/share')

  return (
    <body
      className={cn(
        'min-h-screen flex flex-col font-sans antialiased',
        fontSans.variable,
        !isChatLike && 'overflow-y-auto'
      )}
    >
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      />

      <Script id="google-analytics-script" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <Providers>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider defaultOpen>
            <AppSidebar />
            <div className="flex flex-col flex-1">
              <Header />
              <main
                className={cn(
                  'flex flex-1',
                  isChatLike ? 'min-h-0' : 'flex-col overflow-y-auto'
                )}
              >
               <MusicPlayerProvider>
                <ArtifactRoot>{children}</ArtifactRoot>
                <GlobalMusicBar /> {/* Add this to show bar always */}
              </MusicPlayerProvider>

              </main>
            </div>
          </SidebarProvider>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </Providers>
    </body>
  )
}
