import { NextResponse } from 'next/server';
import { createArticleFromRssItem } from '@/lib/rss/createArticleFromRssItem';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items || [];

    if (!Array.isArray(items) || !items.length) {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    const published = [];

    for (const item of items) {
      const result = await createArticleFromRssItem(item);
      if (result) published.push(result);
    }

    return NextResponse.json({ published });
  } catch (err: any) {
    console.error('Publish Error:', err.message || err);
    return NextResponse.json({ error: 'Failed to publish selected articles' }, { status: 500 });
  }
}
