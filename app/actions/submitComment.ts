'use client'

export const submitCommentClient = async ({
  imageId,
  text,
  parentId
}: {
  imageId: string
  text: string
  parentId?: string
}) => {
  const res = await fetch('/api/submit-comment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageId, text, parentId })
  })

  if (!res.ok) throw new Error('Failed to post comment')
  return res.json()
}
