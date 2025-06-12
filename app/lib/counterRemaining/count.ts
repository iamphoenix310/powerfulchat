import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { client } from '@/app/utils/sanityClient'

export async function getRemainingCount(): Promise<number> {
  const session = await getServerSession(authOptions)

  console.log('[getRemainingCount] session:', session)

  if (!session?.user?.id) {
    console.log('[getRemainingCount] No user in session')
    return 0
  }

  const now = new Date()
  const startOfDay = new Date(now.setUTCHours(0, 0, 0, 0)).toISOString()

  const countQuery = `
    count(*[_type == "imageGeneration" && user._ref == $userId && _createdAt >= $start])
  `

  const count = await client.fetch(countQuery, {
    userId: session.user.id,
    start: startOfDay,
  })

  const DAILY_LIMIT = 5
  const remaining = Math.max(0, DAILY_LIMIT - count)

  console.log('[getRemainingCount] used:', count, '| remaining:', remaining)
  return remaining
}
