"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"
import PostComposer from "@/components/Feed/PostComposer"

interface FeedPost {
  _id: string
  text: string
  image?: any
  author: {
    name: string
    username: string
    profileImage?: any
  }
  _createdAt: string
}

export default function FeedTeaser() {
  const [posts, setPosts] = useState<FeedPost[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      const query = `*[_type == "userFeed"] | order(_createdAt desc)[0...2]{
        _id,
        text,
        image,
        _createdAt,
        author->{
          name,
          username,
          profileImage
        }
      }`
      const result = await client.fetch(query)
      setPosts(result)
    }

    fetchPosts()
  }, [])

  return (
    <section className="w-full bg-white text-black py-20">
      <div className="px-4 max-w-6xl mx-auto space-y-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Your Creative Feed</h2>
        <p className="text-black/70 max-w-xl mx-auto text-base">
          Share your thoughts, images, and updates with the world or just your followers.
        </p>

        {/* Sample posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-black/5 hover:bg-black/10 rounded-lg p-5 space-y-3 border border-black/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                  <Image
                    src={
                      post.author.profileImage
                        ? urlFor(post.author.profileImage, { width: 100, height: 100, crop: true })
                        : "/default-avatar.png"
                    }
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">{post.author.name}</p>
                  <Link href={`/${post.author.username}`} className="text-xs text-black/60 hover:underline">
                    @{post.author.username}
                  </Link>
                </div>
              </div>
              <p className="text-sm leading-relaxed">{post.text}</p>
              {post.image && (
                <div className="relative aspect-[4/3] rounded-md overflow-hidden border border-black/10">
                  <Image
                    src={urlFor(post.image, { width: 800, height: 600, highQuality: true })}
                    alt="Post image"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/feed">
            <Button size="lg" className="px-6 py-3 text-base font-medium">
              Share Your First Update
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
