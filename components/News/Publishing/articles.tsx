'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ArticleCardProps {
  article: {
    _id: string
    title: string
    subtitle?: string
    slug: { current: string }
    mainImage?: any
    publishedAt: string
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link
      href={`/news/${article.slug.current}`}
      className="block rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden"
    >
      {article.mainImage && (
        <div className="relative w-full h-52">
          <Image
            src={article.mainImage.asset.url}
            alt={article.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4 space-y-1">
        <h2 className="text-xl font-bold">{article.title}</h2>
        {article.subtitle && <p className="text-sm text-gray-600">{article.subtitle}</p>}
        <p className="text-xs text-gray-400">{new Date(article.publishedAt).toLocaleDateString()}</p>
      </div>
    </Link>
  )
}
