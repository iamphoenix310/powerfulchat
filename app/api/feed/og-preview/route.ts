import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/113.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
        'Connection': 'keep-alive',
      },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch page: ${res.status}` }, { status: 200 })
    }

    const html = await res.text()
    console.log("Fetched HTML length:", html.length)

    const $ = cheerio.load(html)

    const getMeta = (prop: string) =>
      $(`meta[property="${prop}"]`).attr('content') ||
      $(`meta[name="${prop}"]`).attr('content') ||
      ''

    const title = getMeta('og:title') || $('title').text()
    const description = getMeta('og:description') || getMeta('description')
    const image = getMeta('og:image')
    const ogUrl = getMeta('og:url') || url

    if (!title && !description) {
      return NextResponse.json({ error: 'No preview available' }, { status: 200 })
    }

    return NextResponse.json({
      title,
      description,
      image,
      url: ogUrl,
    })
  } catch (err: any) {
    console.error('[OG PREVIEW ERROR]', err.message || err)
    return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 200 })
  }
}
