'use client'

import useSWR from 'swr'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import CommentForm from './commentForm'
import { likeComment } from '@/app/actions/likeComment'
import { editComment } from '@/app/actions/editComment'
import { deleteComment } from '@/app/actions/deleteComment'
import { toast } from 'sonner'
import { urlFor } from '@/app/utils/sanityClient'
import { formatDistanceToNow, format } from 'date-fns'
import ReactMarkdown from 'react-markdown'
import { mentionPlugin } from '@/app/lib/markdown/mentionPlugin'
import {
  PencilSquareIcon,
  TrashIcon,
  ChatBubbleOvalLeftIcon,
  HeartIcon
} from '@heroicons/react/24/outline'
import { LoginModal } from '../GoogleLogin/LoginModel'


type CommentUser = {
  username?: string
  image?: string
  profileImage?: any // Sanity image object
  _id?: string
  email?: string
}

type CommentType = {
  _id: string
  text: string
  _createdAt: string
  user: CommentUser
  likes?: string[]
  parent?: string
  replies?: CommentType[]
}


const fetcher = (url: string) => fetch(url).then((res) => res.json())
const COMMENTS_PAGE_SIZE = 5

export default function CommentList({ imageId }: { imageId: string }) {
  const { data: session } = useSession()
  const { data, mutate } = useSWR(`/api/comments?imageId=${imageId}`, fetcher)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [visibleCount, setVisibleCount] = useState(COMMENTS_PAGE_SIZE)
  const [optimisticComments, setOptimisticComments] = useState<any[]>([])
  const newestRef = useRef<HTMLDivElement | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  const replyInputRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const allComments = [...(data?.comments || []), ...optimisticComments]

  
  const visibleComments = allComments.slice(0, visibleCount)

  const isOwner = (userId: string) =>
    session?.user?.id === userId || session?.user?.email === userId

  const handleLike = async (id: string) => {
    try {
      await likeComment(id)
      mutate()
    } catch {
      toast.error('Could not like comment')
    }
  }

  const handleEdit = async (id: string) => {
    if (editText.trim().length < 2) return toast.error('Too short!')
    await editComment(id, editText.trim())
    toast.success('Comment updated')
    setEditingId(null)
    setEditText('')
    mutate()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    await deleteComment(id)
    toast.success('Comment deleted')
    mutate()
  }

  const handleOptimisticAdd = (newComment: any) => {
    setOptimisticComments(prev => [...prev, newComment])
    setTimeout(() => {
      newestRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 200)
  }
  
  

  useEffect(() => {
    const bc = new BroadcastChannel('comments-sync')
    bc.onmessage = (e) => {
      if (e.data?.imageId === imageId) mutate()
    }
    mutate()
    return () => bc.close()
  }, [imageId, mutate])

  

  return (
  <>
  {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
    <div className="mt-8 space-y-6 text-sm">
    {session?.user ? (
  <CommentForm
    imageId={imageId}
    onSuccess={handleOptimisticAdd}
    mutate={mutate}
  />
) : (
  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
    <p className="text-gray-600 text-sm">You must be logged in to comment.</p>
    <button
      onClick={() => setShowLoginModal(true)}
      className="mt-2 px-4 py-1 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-500"
    >
      Login to Comment
    </button>
  </div>
)}


      {visibleComments.map((comment: CommentType, idx: number) => (
        <div
          key={comment._id}
          ref={idx === visibleComments.length - 1 ? newestRef : null}
          className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 transition hover:shadow-md"
        >
          <div className="flex items-start gap-3">
          {comment.user?.profileImage?.asset ? (
              <Image
                src={urlFor(comment.user.profileImage, { width: 72, height: 72 })}
                alt={comment.user.username || 'User'}
                width={36}
                height={36}
                className="rounded-full w-9 h-9 object-cover"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm uppercase">
                {comment.user?.username?.charAt(0) || 'U'}
              </div>
            )}


            <div className="flex-1">
              <div className="text-gray-800">
              {comment.user?.username ? (
                    <Link
                      href={`/${comment.user.username}`}
                      className="font-semibold text-indigo-600 hover:underline"
                    >
                      {comment.user.username}
                    </Link>
                  ) : (
                    <span className="font-semibold text-gray-900">You</span>
                  )}
{' '}
                {editingId === comment._id ? (
                  <>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full text-sm px-3 py-2 mt-2 border rounded"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(comment._id)}
                        className="text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditText('')
                        }}
                        className="text-sm text-gray-600 hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <ReactMarkdown
                    className="inline prose prose-sm max-w-none"
                    remarkPlugins={[mentionPlugin]}
                  >
                    {comment.text}
                  </ReactMarkdown>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-gray-500 text-xs">
                {comment._createdAt && (
                  <span
                    title={format(new Date(comment._createdAt), 'PPPp')}
                    className="cursor-default"
                  >
                    {formatDistanceToNow(new Date(comment._createdAt), { addSuffix: true })}
                  </span>
                )}
                <button
                  onClick={() => {
                    setReplyingTo(comment._id)
                    setTimeout(() => {
                      const inputEl = replyInputRefs.current[comment._id]
                      inputEl?.focus()
                      inputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 100)
                  }}
                  className="hover:text-red-500"
                >
                  </button>
                  <button onClick={() => handleLike(comment._id)} className="flex items-center gap-1 hover:text-red-500">
                    <HeartIcon className="w-4 h-4" />
                    {comment.likes?.length || 0}
                  </button>

                
                {!comment.parent && (
                  <button
                  onClick={() => {
                    setReplyingTo(comment._id)
                    setTimeout(() => {
                      const inputEl = replyInputRefs.current[comment._id]
                      inputEl?.focus()
                      inputEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }, 100)
                  }}
                  className="flex items-center gap-1 hover:text-indigo-500"
                >
                  <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                  Reply
                </button>
                
                )}
                {isOwner((comment.user?._id || comment.user?.email) ?? '') && (
                  <>
                   <button
                        onClick={() => {
                          setEditingId(comment._id)
                          setEditText(comment.text)
                        }}
                        className="flex items-center gap-1 hover:text-yellow-500"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit
                      </button>

                      <button onClick={() => handleDelete(comment._id)} className="flex items-center gap-1 hover:text-red-500">
                      <TrashIcon className="w-4 h-4" />
                    </button>

                  </>
                )}
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-3 border-l-2 border-gray-100 pl-5">
              {comment.replies?.map((reply: CommentType) => (
                    <div key={reply._id} className="flex items-start gap-3">
                  {reply.user?.profileImage?.asset ? (
                    <Image
                      src={urlFor(reply.user.profileImage, { width: 64, height: 64 })}
                      alt={reply.user.username || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full w-8 h-8 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-sm uppercase">
                      {reply.user?.username?.charAt(0) || 'U'}
                    </div>
                  )}



                      <div>
                        <p className="text-gray-700">
                        {reply.user?.username ? (
                      <Link
                        href={`/${reply.user.username}`}
                        className="font-semibold text-indigo-600 hover:underline"
                      >
                        {reply.user.username}
                      </Link>
                    ) : (
                      <span className="font-semibold text-gray-900">You</span>
                    )}
{' '}
                          <ReactMarkdown
                            className="inline prose prose-sm text-gray-700 max-w-none"
                            remarkPlugins={[mentionPlugin]}
                          >
                            {reply.text}
                          </ReactMarkdown>
                        </p>
                        <span
                          title={format(new Date(reply._createdAt), 'PPPp')}
                          className="text-gray-400 text-xs"
                        >
                          {formatDistanceToNow(new Date(reply._createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === comment._id && (
                <div className="mt-4">
                 {session?.user ? (
                  <CommentForm
                    imageId={imageId}
                    parentId={comment._id}
                    onSuccess={handleOptimisticAdd}
                    mutate={mutate}
                    textareaRef={(el) => (replyInputRefs.current[comment._id] = el)}
                  />
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-indigo-500 text-sm hover:underline mt-2"
                  >
                    Login to reply
                  </button>
                )}

                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {allComments.length > visibleCount && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + COMMENTS_PAGE_SIZE)}
            className="mt-4 text-sm text-indigo-600 hover:underline font-medium"
          >
            Load more comments
          </button>
        </div>
      )}
    </div>
    </>
  )
}
