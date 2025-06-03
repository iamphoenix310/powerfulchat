import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { getServerSession } from 'next-auth'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser()
  return user?.id ?? 'anonymous'
}
