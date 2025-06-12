import { NextResponse } from 'next/server';
import { client } from '@/app/utils/sanityClient';

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 });
  }

  try {
    const query = `*[_type == "user" && email == $email][0]{_id}`;

    const user = await client.fetch(query, { email });

    if (!user?._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await client
      .patch(user._id)
      .set({ unsubscribed: true })
      .commit();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
