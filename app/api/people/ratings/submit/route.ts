import { NextResponse } from 'next/server'
import { client } from '@/app/utils/sanityClient'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions' // adjust path

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const { personId, ratings } = await req.json()

  if (!personId || !ratings) {
    return NextResponse.json({ error: 'Missing data' }, { status: 400 })
  }

  try {
    // Check if user has already voted
        const person = await client.fetch(
        `*[_type == "facesCelebs" && _id == $id][0]{
          votedUsers[]->{
            _id
          }
        }`,
        { id: personId }
      )


    const alreadyVoted = person?.votedUsers?.some(
      (u: any) => u?._id === userId
    )

    const patch = client
      .patch(personId)
      .setIfMissing({ numberofratings: 0, votedUsers: [] })
      .set(ratings) // always update the latest values

    if (!alreadyVoted) {
      patch.inc({ numberofratings: 1 })
      patch.insert('after', 'votedUsers[-1]', [
        { _type: 'reference', _ref: userId }
      ])
    }

    await patch.commit()

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('❌ Rating submit failed', err)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }
}
