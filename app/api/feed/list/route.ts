import { NextResponse } from "next/server"
import { client } from "@/app/utils/sanityClient"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get("userId")?.replace(/^drafts\./, "") || null
  const session = await getServerSession(authOptions)
  const currentUserId = session?.user?.id?.replace(/^drafts\./, "")

  let query: string
  let params: Record<string, any> = {}

  if (userId) {
    // User-specific profile feed
    query = `
      *[_type == "userFeed" && author._ref == $userId]
      | order(createdAt desc)[0...50] {
        _id, text, visibility, createdAt, image, likes, linkPreview,
        author->{_id, username, profileImage}
      }
    `
    params = { userId }
  } else if (!currentUserId) {
    // Public feed for unauthenticated users
    query = `
      *[_type == "userFeed" && visibility == "public"]
      | order(createdAt desc)[0...50] {
        _id, text, visibility, createdAt, image, likes, linkPreview,
        author->{_id, username, profileImage}
      }
    `
  } else {
    // Feed for authenticated users
    query = `
      *[_type == "userFeed" && (
        visibility == "public" || 
        (visibility == "followers" && (
          author._ref == $currentUserId || 
          author._ref in *[_type == "follow" && follower._ref == $currentUserId].following[]._ref
        ))
      )]
      | order(createdAt desc)[0...50] {
        _id, text, visibility, createdAt, image, likes, linkPreview,
        author->{_id, username, profileImage}
      }
    `
    params = { currentUserId }
  }

  const posts = await client.fetch(query, params)

  // Mark initiallyLiked
  let likedPostIds: string[] = []
  if (currentUserId) {
    const liked = await client.fetch(
      `*[_type == "feedLike" && user._ref == $userId]{ "postId": userFeed._ref }`,
      { userId: currentUserId }
    )
    likedPostIds = liked.map((item: any) => item.postId)
  }

  const postsWithLikeInfo = posts.map((post: any) => ({
    ...post,
    initiallyLiked: likedPostIds.includes(post._id),
  }))

  return NextResponse.json({ posts: postsWithLikeInfo })
}
