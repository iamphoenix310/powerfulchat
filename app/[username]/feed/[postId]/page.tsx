import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import { client, urlFor } from "@/app/utils/sanityClient"
import FeedPostCardClient from "@/components/Feed/FeedPostClient"
import type { Metadata, ResolvingMetadata } from "next"
import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

type Props = {
  params: {
    username: string
    postId: string
  }
}

export async function generateMetadata(
  { params }: Props,
  _parent?: ResolvingMetadata
): Promise<Metadata> {
  const { username, postId } = params

  const query = `*[_type == "userFeed" && _id == $postId && author->username == $username][0]{
    text,
    image,
    linkPreview,
    author->{
      username,
      profileImage
    }
  }`

  const post = await client.fetch(query, { postId, username })

  if (!post) return {}

  const { text, linkPreview } = post

  const fallbackDescription =
    linkPreview?.title ||
    "Shared a link on Powerful"

  const ogImage = post.image
    ? urlFor(post.image, { width: 1200, height: 630 })
    : post.author?.profileImage?.asset
    ? urlFor(post.author.profileImage, { width: 1200, height: 630 })
    : "https://visitpowerful.com/default-og-image.jpg"

  return {
    title: `Post by ${post.author.username}`,
    description: text?.slice(0, 160) || fallbackDescription,
    openGraph: {
      title: `Post by ${post.author.username}`,
      description: text?.slice(0, 160) || fallbackDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Post by ${post.author.username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `Post by ${post.author.username}`,
      description: text?.slice(0, 160) || fallbackDescription,
      images: [ogImage],
    },
  }
}

export default async function FeedPostPage({ params }: Props) {
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
