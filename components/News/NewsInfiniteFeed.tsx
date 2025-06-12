'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { newsClient } from '@/app/utils/sanityClient'
import ArticleCard from './ArticleCard'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'

const BATCH_SIZE = 20

export default function NewsInfiniteFeed({ initialArticles }: { initialArticles: any[] }) {
  const [articles, setArticles] = useState(initialArticles)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)

  // Fetch categories once
  useEffect(() => {
    const fetchCategories = async () => {
    const result = await newsClient.fetch(`
      *[_type == "articleCategory" && count(*[_type == "articles" && references(^._id)]) > 0] | order(title asc) {
        _id,
        title
      }
    `)
    setCategories(result)
  }

    fetchCategories()
  }, [])

  const lastArticleRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  const loadMore = async () => {
    setLoading(true)
    const nextPage = page + 1

    const query = selectedCategory
      ? `*[_type == "articles" && $catId in categories[]._ref && !(_id in path("drafts.**"))] | order(_createdAt desc)[${page * BATCH_SIZE}...${(page + 1) * BATCH_SIZE}]{
          _id, title, subtitle, slug, mainImage, publishedAt, isBreaking, categories[]-> { title }, tags
        }`
      : `*[_type == "articles" && !(_id in path("drafts.**"))] | order(_createdAt desc)[${page * BATCH_SIZE}...${(page + 1) * BATCH_SIZE}]{
          _id, title, subtitle, slug, mainImage, publishedAt, isBreaking, categories[]-> { title }, tags
        }`

    const newArticles = await newsClient.fetch(query, {
      catId: selectedCategory,
    })

    if (newArticles.length < BATCH_SIZE) setHasMore(false)
    setArticles(prev => [...prev, ...newArticles])
    setPage(nextPage)
    setLoading(false)
  }

  const handleCategoryChange = async (catId: string | null) => {
    setSelectedCategory(catId)
    setPage(1)
    setHasMore(true)
    setLoading(true)

    const query = catId
      ? `*[_type == "articles" && $catId in categories[]._ref && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...${BATCH_SIZE}]{
          _id, title, subtitle, slug, mainImage, publishedAt, isBreaking, categories[]-> { title }, tags
        }`
      : `*[_type == "articles" && !(_id in path("drafts.**"))] | order(_createdAt desc)[0...${BATCH_SIZE}]{
          _id, title, subtitle, slug, mainImage, publishedAt, isBreaking, categories[]-> { title }, tags
        }`

    const freshArticles = await newsClient.fetch(query, { catId })
    setArticles(freshArticles)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Category Selector */}
      <div className="flex overflow-x-auto gap-3 pb-2 border-b border-muted/30 mb-2">
        <Button
          variant={selectedCategory ? 'outline' : 'default'}
          onClick={() => handleCategoryChange(null)}
          className="whitespace-nowrap"
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat._id}
            variant={selectedCategory === cat._id ? 'default' : 'outline'}
            onClick={() => handleCategoryChange(cat._id)}
            className={clsx('whitespace-nowrap')}
          >
            {cat.title}
          </Button>
        ))}
      </div>

      {/* Article Feed */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, idx) => (
          <div
            key={article._id}
            ref={idx === articles.length - 1 ? lastArticleRef : null}
          >
            <ArticleCard article={article} />
          </div>
        ))}
        {loading && (
          <p className="col-span-full text-center text-muted-foreground">
            Loading more...
          </p>
        )}
      </div>
    </div>
  )
}
