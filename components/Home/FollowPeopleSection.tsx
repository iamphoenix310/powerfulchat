"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { client, urlFor } from "@/app/utils/sanityClient"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import FollowButton from "@/components/User/FollowSystem/Follow"

interface User {
  _id: string
  username: string
  name: string
  verified?: boolean
  profileImage?: any
  image?: string
}

export default function FollowPeopleSection() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const query = `*[_type == "user" && defined(username)] | order(_createdAt desc) {
        _id,
        username,
        name,
        verified,
        profileImage,
        image
      }`

      const result = await client.fetch(query)

      const filtered = result
        .filter(
          (u: User) =>
            u.username &&
            (u.profileImage?.asset || u.image) // only users with at least one valid image
        )
        .sort(() => 0.5 - Math.random())
        .slice(0, 4)

      setUsers(filtered)
    }

    fetchUsers()
  }, [])

  return (
    <section className="w-full bg-black text-white py-20">
      <div className="px-4 max-w-6xl mx-auto space-y-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Discover and Follow Creators</h2>
        <p className="text-white/70 max-w-xl mx-auto text-base">
          Join the community and follow people whose work you love. Stay connected with every post and upload.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {users.map((user) => {
            const profileImageSrc =
              user.profileImage?.asset
                ? urlFor(user.profileImage, { width: 200, height: 200, crop: true })
                : user.image
                ? user.image
                : "/default-avatar.png"

            return (
              <div
                key={user._id}
                className="bg-white/5 hover:bg-white/10 rounded-xl p-5 text-center transition flex flex-col items-center"
              >
                {/* Profile Image */}
                <div className="w-20 h-20 relative rounded-full overflow-hidden mb-3 border border-white/10">
                  <Image
                    src={profileImageSrc}
                    alt={user.name || "User"}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/default-avatar.png"
                    }}
                  />
                </div>

                {/* Name & Username */}
                <div className="space-y-1">
                  <p className="font-medium text-sm flex items-center justify-center gap-1 text-white">
                    {user.name}
                    {user.verified && <CheckCircle className="w-4 h-4 text-blue-400" />}
                  </p>
                  <Link href={`/${user.username}`}>
                    <p className="text-xs text-white/50 hover:underline">@{user.username}</p>
                  </Link>
                </div>

                {/* Follow Button */}
                <div className="mt-3">
                  <FollowButton targetUserId={user._id} isFollowing={false} />
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-10">
          <Link href="/auth?mode=signup">
            <Button size="lg" variant="secondary" className="px-6 py-3 text-base font-medium">
              Join the Community
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
