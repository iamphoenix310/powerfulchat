import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['media:content', 'dc:creator', 'content:encoded'],
  },
});

export async function GET() {
  try {
    const feed = await parser.parseURL('https://pagesix.com/feed/');
    const items = feed.items.map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      guid: item.guid || item.link,
      description: item.contentSnippet || '',
      image:
        item.enclosure?.url ||
        item['media:content']?.url ||
        null,
    }));

    return NextResponse.json({ items });
  } catch (err: any) {
    console.error('RSS Fetch Error:', err);
    return NextResponse.json({ error: 'Failed to fetch RSS feed.' }, { status: 500 });
  }
}
