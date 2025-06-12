'use client'

import React from 'react'
import { PortableText, type PortableTextComponents } from '@portabletext/react'
import Image from 'next/image'
import Link from 'next/link'
import { urlFor } from '@/app/utils/sanityClient'
import AdBlock from '@/components/Ads/AdBlock'

type PortableTextRendererProps = {
  value: any
  celebrities?: { name: string; slug: string }[]
}

const PortableTextRenderer = ({ value, celebrities = [] }: PortableTextRendererProps) => {
 
  const components: PortableTextComponents = {
    block: {
      h1: ({ children }) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
      h2: ({ children }) => <h2 className="text-3xl font-semibold my-5">{children}</h2>,
      h3: ({ children }) => <h3 className="text-2xl font-semibold my-4">{children}</h3>,
      h4: ({ children }) => <h4 className="text-xl font-medium my-4">{children}</h4>,
      blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700 dark:text-gray-300 my-6">
          {children}
        </blockquote>
      ),
     normal: ({ children }: { children?: React.ReactNode }) => {
  if (!celebrities.length || !children) {
    return <p className="my-4 leading-relaxed">{children}</p>
  }

  const wrapCelebNames = (child: React.ReactNode): React.ReactNode => {
    if (typeof child === 'string') {
      // Match names inside the string
      let parts: React.ReactNode[] = [child]
      celebrities.forEach(({ name, slug }) => {
        const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`\\b(${safeName})\\b`, 'gi')
        parts = parts.flatMap(part => {
          if (typeof part !== 'string') return part
          const pieces = []
          let lastIndex = 0
          let match
          while ((match = regex.exec(part)) !== null) {
            const before = part.slice(lastIndex, match.index)
            const matchText = match[1]
            const afterIndex = match.index + matchText.length
            if (before) pieces.push(before)
            pieces.push(
              <Link key={`${slug}-${match.index}`} href={`/people/${slug}`} className="text-blue-600 hover:underline">
                {matchText}
              </Link>
            )
            lastIndex = afterIndex
          }
          if (lastIndex < part.length) {
            pieces.push(part.slice(lastIndex))
          }
          return pieces
        })
      })
      return parts
    }

    if (React.isValidElement(child) && child.props?.children) {
      return React.cloneElement(child, {
        ...child.props,
        children: wrapCelebNames(child.props.children),
      })
    }

    if (Array.isArray(child)) {
      return child.map(wrapCelebNames)
    }

    return child
  }

  const wrapped = wrapCelebNames(children)

  return <p className="my-4 leading-relaxed">{wrapped}</p>
}

    },
    marks: {
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children }) => (
        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
          {children}
        </code>
      ),
      underline: ({ children }) => <span className="underline">{children}</span>,
      link: ({ value, children }) => (
        <a
          href={value?.href}
          className="text-blue-600 underline hover:text-blue-800 transition"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
    },
    types: {
      image: ({ value }) => {
        if (!value?.asset) return null
        return (
          <div className="my-6 rounded overflow-hidden shadow-md">
            <Image
              src={urlFor(value, { width: 1000, crop: true })}
              alt={value.alt || 'News image'}
              width={1000}
              height={600}
              className="w-full h-auto rounded-xl object-cover"
            />
            {value.caption && (
              <p className="text-sm text-center text-gray-500 mt-2">{value.caption}</p>
            )}
          </div>
        )
      },
      youtube: ({ value }) => {
        const match = value.url?.match(/(?:v=|\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/)
        const videoId = match?.[1]
        if (!videoId) return null

        return (
          <div className="aspect-video w-full my-6">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )
      },
      adblock: () => <AdBlock adSlot="9995634858" />,
    },
    list: {
      bullet: ({ children }) => <ul className="list-disc ml-6 mb-4">{children}</ul>,
      number: ({ children }) => <ol className="list-decimal ml-6 mb-4">{children}</ol>,
    },
    listItem: {
      bullet: ({ children }) => <li className="my-1">{children}</li>,
      number: ({ children }) => <li className="my-1">{children}</li>,
    },
  }

  const insertAdBlocks = (content: any[]) => {
    const result: any[] = []
    let headingCount = 0

    for (let i = 0; i < content.length; i++) {
      const block = content[i]
      const isHeading =
        block._type === 'block' && ['h1', 'h2', 'h3', 'h4'].includes(block.style)

      if (isHeading) {
        headingCount++
        if (headingCount % 2 === 0) {
          result.push({
            _type: 'adblock',
            _key: `ad-${i}-${headingCount}`,
          })
        }
      }

      result.push(block)
    }

    return result
  }

  const modifiedValue = insertAdBlocks(value)

  return <PortableText value={modifiedValue} components={components} />
}

export default PortableTextRenderer
