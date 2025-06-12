import { NextResponse } from 'next/server';
import { client } from '@/app/utils/sanityClient';

export async function POST(req: Request) {
    const { imageId } = await req.json();
    
  if (!imageId) {
    return NextResponse.json({ error: 'Missing imageId' }, { status: 400 });
  }

  try {
    const result = await client
      .patch(imageId)
      .setIfMissing({ views: 0 })
      .inc({ views: 1 })
      .commit();

    return NextResponse.json({ success: true, views: result.views });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 });
  }
}
