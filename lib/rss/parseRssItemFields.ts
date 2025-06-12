import { nanoid } from 'nanoid'

export async function parseRssItemFields(item: any) {
  const title = item.title || 'Untitled'
  const contentSnippet = item['content:encoded'] || item.content || item.description
  const pubDate = item.pubDate || new Date().toISOString()
  const sourceUrl = item.link
  const rawImage = item['media:content']?.url || null

  return {
    _key: nanoid(),
    title,
    sourceUrl,
    contentSnippet,
    pubDate,
    rawImage,
    creator: item['dc:creator'] || null,
  }
}
