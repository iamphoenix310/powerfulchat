import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { client } from "@/app/utils/sanityClient"
import FeedPostCardClient from "@/components/Feed/FeedPostClient"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function FeedPostPage({
  params,
}: {
  params: { username: string; postId: string }
}) {
  const { username, postId } = params
  const session = await getServerSession(authOptions)

  const query = `*[_type == "userFeed" && _id == $postId && author->username == $username][0]{
    _id,
    text,
    createdAt,
    visibility,
    image,
    "likes": count(*[_type == "feedLike" && userFeed._ref == ^._id]),
    "initiallyLiked": false,
    author->{
      _id,
      username,
      profileImage
    }
  }`

  const post = await client.fetch(query, { postId, username })

  if (!post) return notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <FeedPostCardClient post={post} sessionUserId={session?.user?.id} />
    </div>
  )
}
