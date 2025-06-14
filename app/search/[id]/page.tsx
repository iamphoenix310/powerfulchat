export const dynamic = 'force-dynamic'

import { Chat } from '@/components/chat'
import { DefaultSkeleton } from '@/components/default-skeleton'
import { getChat } from '@/lib/actions/chat'
import { getCurrentUserId } from '@/lib/auth/get-current-user'
import { getModels } from '@/lib/config/models'
import { convertToUIMessages } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'

export const maxDuration = 60

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await and destructure params
  const userId = await getCurrentUserId()
  const chat = await getChat(id, userId)

  return {
    title: chat?.title?.slice(0, 50) || 'Search',
  }
}

export default async function SearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // Await and destructure params
  const userId = await getCurrentUserId()
  const chat = await getChat(id, userId)

  if (!chat) redirect('/')
  if (chat.userId !== userId && chat.userId !== 'anonymous') notFound()

  const messages = convertToUIMessages(chat.messages || [])
  const models = await getModels()

  return (
    <Suspense fallback={<DefaultSkeleton />}>
      <Chat id={id} savedMessages={messages} models={models} />
    </Suspense>
  )
}