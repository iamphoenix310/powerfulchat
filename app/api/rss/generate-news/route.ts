import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { parseRssItemFields } from '@/lib/rss/parseRssItemFields'

const RSS_FEED_URL = 'https://pagesix.com/celebrity-news/feed/'

const parser = new Parser({
  customFields: {
    item: ['media:content', 'dc:creator', 'content:encoded'],
  },
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const feed = await parser.parseURL(RSS_FEED_URL)
    const items = feed.items?.slice(0, 5) || []

    const results = []

    for (const item of items) {
      const parsed = await parseRssItemFields(item)
      results.push(parsed)
    }

    return NextResponse.json({ articles: results })
  } catch (err: any) {
    console.error('RSS Error:', err.message || err)
    return NextResponse.json({ error: 'Failed to process RSS feed.' }, { status: 500 })
  }
}
