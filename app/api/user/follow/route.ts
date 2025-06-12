// /app/api/follow/route.ts
import { client } from '@/app/utils/sanityClient';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
  const { currentUserId, targetUserId, action } = await req.json();

  if (!currentUserId || !targetUserId || !['follow', 'unfollow'].includes(action)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const patchCurrent = client.patch(currentUserId);
  const patchTarget = client.patch(targetUserId);

  if (action === 'follow') {
    patchCurrent.setIfMissing({ following: [] }).append('following', [{ _type: 'reference', _ref: targetUserId }]);
    patchTarget.setIfMissing({ followers: [] }).append('followers', [{ _type: 'reference', _ref: currentUserId }]);
  } else {
    patchCurrent.unset([`following[_ref=="${targetUserId}"]`]);
    patchTarget.unset([`followers[_ref=="${currentUserId}"]`]);
  }

  await client.transaction().patch(patchCurrent).patch(patchTarget).commit();
  revalidatePath(`/profile/${targetUserId}`); // revalidate the target profile page

  return NextResponse.json({ success: true });
}
