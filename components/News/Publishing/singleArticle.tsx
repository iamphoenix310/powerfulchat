'use client'

import Image from 'next/image'

export default function ArticleSingle({ article }: { article: any }) {
  return (
    <div className="prose max-w-3xl mx-auto p-4">
      <h1 className="text-4xl font-bold">{article.title}</h1>
      {article.subtitle && <h2 className="text-xl text-gray-600">{article.subtitle}</h2>}
      {article.mainImage && (
        <div className="my-4">
          <Image
            src={article.mainImage.asset.url}
            alt={article.title}
            width={1200}
            height={600}
            className="rounded-xl"
          />
        </div>
      )}
      <p className="text-sm text-gray-400">
        Published: {new Date(article.publishedAt).toLocaleDateString()}
      </p>
      <div className="mt-6 space-y-6">
        {article.intro && <div>{article.intro.map((block: any, i: number) => <p key={i}>{block.children[0].text}</p>)}</div>}
        {article.body && <div>{article.body.map((block: any, i: number) => <p key={i}>{block.children[0].text}</p>)}</div>}
        {article.outro && <div>{article.outro.map((block: any, i: number) => <p key={i}>{block.children[0].text}</p>)}</div>}
      </div>
    </div>
  )
}
