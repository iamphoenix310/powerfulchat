// app/api/user/profile-image/route.ts
import { client } from '@/app/utils/sanityClient';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    const data = await client.fetch(
      `*[_type == "user" && _id == $userId][0]{ profileImage }`,
      { userId }
    );

    return NextResponse.json({ profileImage: data?.profileImage });
  } catch (err) {
    console.error('[PROFILE IMAGE FETCH ERROR]', err);
    return NextResponse.json({ error: 'Failed to fetch profile image' }, { status: 500 });
  }
}
