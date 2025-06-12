'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { urlFor } from '@/app/utils/sanityClient'
import ClientDate from '@/components/Shared/ClientDate'
import PortableTextRenderer from '@/components/Shared/PortableTextRenderer'
import AdBlock from '@/components/Ads/AdBlock'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXTwitter } from '@fortawesome/free-brands-svg-icons'
import {
  FacebookShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  WhatsappIcon,
  EmailIcon,
} from 'react-share'

import { CopyToClipboard } from 'react-copy-to-clipboard'
import { toast } from 'react-toastify'

import {
  LinkIcon,
  XIcon as LucideXIcon,
  MailIcon,
  FacebookIcon as LucideFacebook,
  Share2Icon,
} from 'lucide-react'
import ArticleComments from './ArticleComments'

export default function ArticleFullView({
  article,
  facesCelebs = [],
}: {
  article: any
  facesCelebs?: { name: string; slug: string }[]
}) {
  const [copied, setCopied] = useState(false)

  const author = article.author?.[0] || null
  const authorImage = author?.profileImage
    ? urlFor(author.profileImage, { width: 80, height: 80 })
    : null

  const authorName = author?.name || 'Powerful Editor'
  const authorBio = author?.fullBio || 'An experienced contributor at Powerful Creations.'
  const authorHeadline = author?.headline || null
  const authorUsername = author?.username || null

  const currentUrl = useMemo(() => (typeof window !== 'undefined' ? window.location.href : ''), [])

  return (
    <article className="max-w-3xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="mb-6 text-left">
        <p className="text-gray-600 mb-4 hover:underline">
          <Link href="/news">&larr; Back to News</Link>
        </p>
        <h1 className="text-3xl font-bold">{article.title}</h1>
        {article.subtitle && (
          <p className="text-lg text-gray-600 mt-2">{article.subtitle}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          <ClientDate iso={article.publishedAt} />
        </p>
      </div>

      {/* Main Image */}
      {article.mainImage && (
        <div className="w-full mb-8">
          <Image
            src={urlFor(article.mainImage, { width: 1200 })}
            alt={article.title}
            width={1200}
            height={Math.floor(1200 * 0.5625)}
            className="rounded-xl w-full h-auto"
            priority
          />
        </div>
      )}
      {article.mainImage?.caption && (
          <p className="text-sm text-center text-gray-500">
            {article.mainImage.caption}
          </p>
        )}


      {/* Content */}
      <div className="prose max-w-none prose-lg prose-slate dark:prose-invert">
        {article.intro && (
          <section className="mb-6">
            <PortableTextRenderer value={article.intro} celebrities={facesCelebs} />
          </section>
        )}
        {article.body && (
          <section className="mb-6">
            <PortableTextRenderer value={article.body} celebrities={facesCelebs} />
          </section>
        )}
        {article.outro && (
          <section className="mt-6 border-t pt-6">
            <PortableTextRenderer value={article.outro} celebrities={facesCelebs} />
          </section>
        )}
      </div>

      {/* Ad */}
      <AdBlock adSlot="8397118667" className="my-6" />

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2 border-t pt-6">
          {article.tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Share Buttons */}
      <div className="mt-10 py-6 bg-white shadow-lg rounded-xl border border-slate-200">
        <p className="text-center text-slate-700 font-medium mb-4">Share this Article</p>
        <div className="flex justify-center items-center gap-3 sm:gap-4 flex-wrap px-4">
          <FacebookShareButton url={currentUrl}>
            <div className="bg-blue-600 hover:bg-blue-700 p-2 rounded-full text-white">
              <LucideFacebook className="w-5 h-5" />
            </div>
          </FacebookShareButton>

        {/* X (Twitter) Button */}
         <Link
          href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(article.title)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-9 h-9 bg-black hover:bg-neutral-800 text-white rounded-full transition"
        >
          <FontAwesomeIcon icon={faXTwitter} className="h-4 w-4" />
        </Link>

          <WhatsappShareButton url={currentUrl} title={article.title}>
          <WhatsappIcon size={36} round className="opacity-90 hover:opacity-100 transition-opacity" />
        </WhatsappShareButton>

          <EmailShareButton
            url={currentUrl}
            subject={`Interesting Read: ${article.title}`}
            body={`Hi,\n\nI found this article interesting and thought you might like it:\n\n${currentUrl}\n\nEnjoy!`}
          >
            <div className="bg-red-500 hover:bg-red-600 p-2 rounded-full text-white">
              <MailIcon className="w-5 h-5" />
            </div>
          </EmailShareButton>

          <CopyToClipboard
            text={currentUrl}
            onCopy={() => {
              setCopied(true)
              toast.success('Link Copied!')
              setTimeout(() => setCopied(false), 2000)
            }}
          >
            <button
              title="Copy link"
              className={`flex items-center justify-center p-2 rounded-full transition
              ${copied
                ? 'bg-green-500 text-white ring-2 ring-green-300 shadow-md'
                : 'bg-gray-300 hover:bg-blue-500 text-gray-700 hover:text-white'
              }`}
            >
              <LinkIcon className="w-5 h-5" />
            </button>
          </CopyToClipboard>
        </div>
      </div>

      

      {/* Author */}
      <section className="mt-10 border-t pt-6 text-sm text-gray-600">
        <div className="flex items-start gap-4">
          {authorImage && (
            <Image
              src={authorImage}
              alt={authorName}
              width={60}
              height={60}
              className="rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-semibold text-black">
              {authorUsername ? (
                <Link href={`/${authorUsername}`} className="hover:underline">
                  {authorName}
                </Link>
              ) : (
                authorName
              )}
            </p>
            {authorHeadline && <p className="text-xs text-gray-500">{authorHeadline}</p>}
            <p className="mt-1">{authorBio}</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Published by <strong>Powerful</strong>
        </div>
      </section>
      {/* <ToastContainer position="top-center" autoClose={2000} hideProgressBar={true} /> */}
      <ArticleComments articleId={article._id} />
    </article>
  )
}
