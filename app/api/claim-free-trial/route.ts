import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { client } from '@/app/utils/sanityClient';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // 🔒 Ensure user is authenticated
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;

  // 🧠 Fetch Sanity user
  const user = await client.fetch(
    `*[_type == "user" && email == $email][0]`,
    { email }
  );

  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  // 🛡 Check for prior claim
  const alreadyClaimed = user.freeTrialClaimed === true;
  const hasSubscriptionDate = !!user.subscriptionStartDate;
  const hasCredits = (user.subscriptionCredits ?? 0) > 0;

  if (alreadyClaimed || hasSubscriptionDate || hasCredits) {
    return NextResponse.json(
      {
        success: false,
        message: 'You have already claimed your free trial.',
      },
      { status: 400 }
    );
  }

  // ✅ Update user with free trial
  await client
    .patch(user._id)
    .set({
        subscriptionCredits: 5,
        subscriptionActive: false,
        subscriptionStartDate: null,
        freeTrialClaimed: true,
        freeTrialActive: true,
        freeTrialStartDate: new Date().toISOString(),
    })
    .commit();

  return NextResponse.json({ success: true });
}
