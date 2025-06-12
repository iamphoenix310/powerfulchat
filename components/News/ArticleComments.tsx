'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { newsClient } from '@/app/utils/sanityClient'
import { urlFor } from '@/app/utils/sanityClient'
import Link from 'next/link'
import ConfirmDialog from '@/components/Shared/ConfirmDialog'
import { nanoid } from 'nanoid'

const BATCH_SIZE = 10

export default function ArticleComments({ articleId }: { articleId: string }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<any[]>([])
  const [pendingComments, setPendingComments] = useState<any[]>([])
  const [content, setContent] = useState('')
  const [replyContent, setReplyContent] = useState('')
  const [replyTarget, setReplyTarget] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const fetchComments = async () => {
    const res = await newsClient.fetch(
      `*[_type == "articleComments" && article._ref == $articleId && !defined(parentComment)] | order(createdAt desc)[$start...$end]{
        _id,
        content,
        createdAt,
        author->{
          _id,
          name,
          username,
          profileImage
        },
        "replies": *[_type == "articleComments" && parentComment._ref == ^._id] | order(createdAt asc){
          _id,
          content,
          createdAt,
          author->{
            _id,
            name,
            username,
            profileImage
          }
        }
      }`,
      {
        articleId,
        start: 0,
        end: page * BATCH_SIZE,
      }
    )
    setComments(res)
  }

  useEffect(() => {
    fetchComments()
    const interval = setInterval(fetchComments, 10000)
    return () => clearInterval(interval)
  }, [articleId, page])

  const waitForComment = async (content: string, tries = 6) => {
    for (let i = 0; i < tries; i++) {
      const res = await newsClient.fetch(
        `*[_type == "articleComments" && article._ref == $articleId && content == $content][0]{ _id }`,
        { articleId, content }
      )
      if (res?._id) return res._id
      await new Promise(r => setTimeout(r, 1000))
    }
    return null
  }

  const handleSubmit = async () => {
    const user = session?.user as any
    const userId = user?.id
    const activeContent = replyTarget ? replyContent : content

    if (!activeContent.trim() || !userId) return
    setLoading(true)

    const tempId = `temp-${nanoid()}`

    const optimisticComment = {
      _id: tempId,
      content: activeContent,
      createdAt: new Date().toISOString(),
      author: {
        _id: userId,
        name: user.name,
        username: user.username,
        profileImage: user.image,
      },
      replies: [],
      pending: true,
    }

    if (!replyTarget) {
      setPendingComments(prev => [optimisticComment, ...prev])
    } else {
      setComments(prev =>
        prev.map(comment =>
          comment._id === replyTarget
            ? {
                ...comment,
                replies: [...comment.replies, optimisticComment],
              }
            : comment
        )
      )
    }

    const res = await fetch('/api/articles/comments/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId,
        content: activeContent,
        authorId: userId,
        ...(replyTarget && { parentComment: replyTarget }),
      }),
    })

    if (res.ok) {
        setContent('')
        setReplyContent('')
        setReplyTarget(null)

        const matchedId = await waitForComment(activeContent)

        await fetchComments()

        // wait until the new comment is truly visible in comments[]
        setPendingComments(prev => prev.filter(p => p._id !== tempId))
        }


    setLoading(false)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch('/api/articles/comments/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commentId: deleteTarget,
        userId: (session?.user as any)?.id,
      }),
    })

    if (res.ok) {
      fetchComments()
    } else {
      alert('Failed to delete comment')
    }

    setDeleteTarget(null)
  }

  const renderComment = (comment: any, isReply = false) => {
    const imageUrl = comment.author?.profileImage
      ? urlFor(comment.author.profileImage, { width: 80, height: 80 })
      : '/default-avatar.png'

    const isAuthor = comment.author?._id === (session?.user as any)?.id

    return (
     <div
        key={comment._id}
        className={`flex items-start space-x-3 ${
            isReply ? 'ml-6 border-l pl-4 mt-4' : 'mt-6'
        } ${comment.pending ? 'opacity-60 pointer-events-none' : ''}`}
        >

        <Image
          src={imageUrl}
          alt={comment.author?.name || 'User'}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
        <div className="bg-gray-100 p-3 rounded-lg w-full">
          <p className="text-sm font-semibold text-slate-800">
            {comment.author?.username ? (
              <Link href={`/${comment.author.username}`} className="hover:underline">
                {comment.author.name}
              </Link>
            ) : (
              comment.author?.name || 'Anonymous'
            )}
          </p>
          <p className="text-sm text-slate-700 mt-1 whitespace-pre-line">{comment.content}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(comment.createdAt).toLocaleString()}
          </p>

          <div className="flex gap-4 mt-2">
            {session?.user && !isReply && (
              <button
                onClick={() => setReplyTarget(comment._id)}
                className="text-xs text-blue-600 hover:underline"
              >
                Reply
              </button>
            )}

            {session?.user && isAuthor && !comment.pending && (
              <button
                onClick={() => {
                  setDeleteTarget(comment._id)
                  setConfirmOpen(true)
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Delete
              </button>
            )}
          </div>

          {replyTarget === comment._id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                className="w-full border px-3 py-2 rounded text-base"
                placeholder="Write a reply..."
              />
              <button
                onClick={handleSubmit}
                className="mt-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
              >
                Reply
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-xl font-semibold text-slate-800 mb-4">Comments</h3>

     {session?.user ? (
  <div className="flex items-start space-x-3 mb-6">
    <Image
      src={session.user.image || '/default-avatar.png'}
      alt={session.user.name || 'User'}
      width={40}
      height={40}
      className="rounded-full object-cover"
    />
    <div className="flex-1">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        placeholder="Write a comment..."
        className="w-full border px-4 py-2 text-base rounded-lg shadow"
      />
      <button
        onClick={handleSubmit}
        disabled={loading || !content.trim()}
        className="mt-2 px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </button>
    </div>
  </div>
) : (
  <p className="mb-6 text-sm text-gray-600 italic text-center">
   <Link href={'/auth'}> Login to comment. </Link>
  </p>
)}



      <div className="space-y-6">
        {[...pendingComments, ...comments].map(comment => (
          <div key={comment._id}>
            {renderComment(comment)}
            {comment.replies?.map((reply: any) => renderComment(reply, true))}
          </div>
        ))}
      </div>

      {comments.length >= page * BATCH_SIZE && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 rounded"
          >
            Load More Comments
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete this comment?"
        message="This action cannot be undone. Are you sure you want to delete your comment?"
      />
    </div>
  )
}
