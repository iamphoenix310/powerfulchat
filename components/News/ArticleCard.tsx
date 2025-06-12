import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/app/utils/sanityClient'

interface ArticleCardProps {
  article: {
    _id: string
    title: string
    subtitle?: string
    slug?: { current: string }
    mainImage?: any
    publishedAt: string
    isBreaking?: boolean
    tags?: string[]
  }
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = new Date(article.publishedAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  const slug = article.slug?.current || 'not-found'

  const imageUrl = article.mainImage
    ? urlFor(article.mainImage, { width: 800, height: 450, crop: true })
    : '/placeholder.jpg'

  return (
    <Link
      href={`/news/${slug}`}
      className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition group flex flex-col"
    >
      <div className="relative w-full aspect-[16/9]">
        <Image
          src={imageUrl}
          alt={article.title || 'Article thumbnail'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={!!article.isBreaking}
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        {article.isBreaking && (
          <span className="inline-block bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
            🔥 Breaking
          </span>
        )}
        <h3 className="text-lg font-bold line-clamp-2">{article.title}</h3>
        {article.subtitle && (
          <p className="text-sm text-gray-600 line-clamp-2">{article.subtitle}</p>
        )}
        <p className="text-xs text-gray-400">{date}</p>

        {article.tags && article.tags.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-1">
            {article.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
