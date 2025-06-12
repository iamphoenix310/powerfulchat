'use client'

import { useEffect, useState } from 'react'
import { newsClient } from '@/app/utils/sanityClient'
import ArticleCard from '@/components/News/ArticleCard'

export default function PersonNewsSection({ personName }: { personName: string }) {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const pattern = `*${personName}*` // fuzzy match
        const results = await newsClient.fetch(
          `*[_type == "articles" && (
            title match $pattern ||
            intro[].children[].text match $pattern ||
            body[].children[].text match $pattern
          )] | order(publishedAt desc)[0...6]{
            _id,
            title,
            subtitle,
            slug,
            mainImage,
            publishedAt,
            isBreaking,
            categories[]->{ title }
          }`,
          { pattern }
        )
        setArticles(results)
      } catch (error) {
        console.error('Error fetching related news:', error)
      } finally {
        setLoading(false)
      }
    }

    if (personName) fetchNews()
  }, [personName])

  if (loading) return null
  if (!articles || articles.length === 0) return null

  return (
    <div className="mt-10 py-8 px-6 sm:px-8 bg-white shadow-lg rounded-xl border border-slate-200">
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6">
        News About {personName}
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map(article => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  )
}
