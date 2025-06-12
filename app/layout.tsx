import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import BodyWrapper from './BodyWrapper'
import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Powerful AI Answer Engine'
const description =
  'Powerful AI Answer Engine for Every seeker of knowledge. Ask anything, get instant answers, and explore a world of information with Powerful AI.'

export const metadata: Metadata = {
  metadataBase: new URL('https://visitpowerful.com'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: '@powerfulcreat'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <BodyWrapper>{children}</BodyWrapper>
    </html>
  )
}
