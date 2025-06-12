import { NextResponse } from 'next/server';
import { client } from '@/app/utils/sanityClient';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth';
import type { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });

  const user = session?.user;

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { bio, socialLinks } = body;

  try {
    const existing = await client.fetch(
      `*[_type == "user" && email == $email][0]{_id}`,
      { email: user.email }
    );

    if (!existing?._id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ✅ Patch and publish in one go
    await client
      .patch(existing._id)
      .set({ bio, socialLinks })
      .commit({ autoGenerateArrayKeys: true });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
