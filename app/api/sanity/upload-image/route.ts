import { NextResponse } from 'next/server';
import { client } from '@/app/utils/sanityClient';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const asset = await client.assets.upload('image', buffer, {
      filename,
      contentType: file.type || 'image/jpeg',
    });

    return NextResponse.json({ _id: asset._id, url: asset.url });
  } catch (err: any) {
    console.error('Sanity image upload failed:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
