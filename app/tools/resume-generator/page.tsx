import ResumeGenerator from '@/components/Tools/ResumeGenerator/ResumeGenerator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Resume Generator',
  description: 'Generate a professional resume with our AI-powered resume generator. Customize your resume to stand out in the job market.',
  openGraph: {
    title: 'Resume Generator',
    description: 'Generate a professional resume with our AI-powered resume generator. Customize your resume to stand out in the job market.',
    url: '/tools/resume-generator',
    siteName: 'AI Tools',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Tools Resume Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume Generator',
    description: 'Generate a professional resume with our AI-powered resume generator. Customize your resume to stand out in the job market.',
    images: ['https://example.com/og-image.jpg'],
    site: '@your_twitter_handle',
    creator: '@your_twitter_handle',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  keywords: ['resume generator', 'AI resume builder', 'professional resume', 'job application', 'resume writing'],
  authors: [
    {
      name: 'Your Name',
      url: 'https://yourwebsite.com',
    },
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/tools/resume-generator',
    languages: {
      'en': '/tools/resume-generator',
      'es': '/es/tools/resume-generator',
      'fr': '/fr/tools/resume-generator',
    },
  },
  themeColor: '#ffffff',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Resume Generator',
    startupImage: [ 
      '/apple-touch-icon.png',
      '/apple-touch-icon-120x120.png',
      '/apple-touch-icon-180x180.png',
    ],
  },
}

export default function ResumeGeneratorPage() {
  return <ResumeGenerator />
}
