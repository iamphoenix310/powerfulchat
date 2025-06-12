"use client"

import { useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { BadgeCheck, Loader2, Newspaper, GalleryHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import FollowButton from "@/components/User/FollowSystem/Follow"
import UserImageGrid from "@/components/User/userImageGrid"
import UserProfileInfo from "@/components/User/Bio/ProfileInfo"
import UserEditorToggle from "@/components/User/UserEditorToggle"
import ProfileImageUploader from "@/components/User/Bio/ProfileImageUploader"
import FeedComposer from "@/components/Feed/PostComposer"
import FeedList from "@/components/Feed/FeedList"
import { client, urlFor } from "@/app/utils/sanityClient"

interface Props {
  userData: any
  initialImages: any[]
}

export default function UserProfileClient({ userData, initialImages }: Props) {
  const { data: session, status } = useSession()
  const currentUserId = session?.user?.id
  const isOwnProfile = currentUserId === userData?._id

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const waitForUserInfo = async (userId: string, tries = 5) => {
    for (let i = 0; i < tries; i++) {
      const res = await fetch(`/api/user/info?id=${userId}`)
      const data = await res.json()
      if (data && data._id) return data
      await new Promise((r) => setTimeout(r, 1000))
    }
    return null
  }

  useEffect(() => {
    if (!userData?._id) return

    // Always fetch fresh profile on mount
    const fetchFresh = async () => {
      const latest = await waitForUserInfo(userData._id)
      if (latest) setProfile(latest)
      else setProfile(userData)
      setLoading(false)
    }

    fetchFresh()

    // Listen for live profile updates
    const sub = client
      .listen(`*[_type == "user" && _id == "${userData._id}"][0]`)
      .subscribe(async (event) => {
        if (event.result?._id === userData._id) {
          const updated = await waitForUserInfo(userData._id)
          if (updated) setProfile(updated)
        }        
      })

    return () => sub.unsubscribe()
  }, [userData._id])

  const profileImage = profile?.profileImage?.asset
    ? urlFor(profile.profileImage, { width: 150, height: 150 })
    : "/default-avatar.png"

  if (status === "loading" || loading || !profile?._id) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    )
  }

  const isFollowing = currentUserId ? profile?.followers?.includes(currentUserId) : false

  return (
    <div className="w-full px-4 py-10">
      <div className="max-w-screen-lg mx-auto flex items-start gap-6">
        {isOwnProfile ? (
          <ProfileImageUploader userId={profile._id} currentImage={profileImage} />
        ) : (
          <Image
            src={profileImage}
            alt={profile.username}
            width={120}
            height={120}
            className="rounded-full object-cover"
          />
        )}

        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold flex items-center gap-1">
              {profile.username}
              {profile.verified && (
                <span title="Verified user">
                  <BadgeCheck className="h-5 w-5 text-blue-500 fill-blue-500 stroke-white" />
                </span>
              )}
            </h1>
            {!isOwnProfile && (
              <FollowButton targetUserId={profile._id} isFollowing={isFollowing} />
            )}
          </div>

          <div className="flex gap-4 mt-2 text-sm text-gray-600">
            <span>{profile.followers?.length || 0} followers</span>
            <span>{profile.following?.length || 0} following</span>
          </div>

          <UserProfileInfo
            bio={profile.bio}
            verified={profile.verified}
            socialLinks={profile.socialLinks}
          />

          {isOwnProfile && (
            <UserEditorToggle
              user={profile}
              currentUserId={currentUserId || ""}
              onSuccess={async () => {
                const updated = await waitForUserInfo(profile._id)
                if (updated) setProfile(updated)
              }}
            />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10 w-full">
        <div className="flex justify-center">
          <Tabs defaultValue="feed" className="w-full max-w-5xl">
            <TabsList className="flex justify-center gap-3 p-2 mb-6 w-full bg-transparent">
  <TabsTrigger
    value="feed"
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md transition"
  >
    <Newspaper className="w-4 h-4" />
    Feed
  </TabsTrigger>
  <TabsTrigger
    value="content"
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-md transition"
  >
    <GalleryHorizontal className="w-4 h-4" />
    Content
  </TabsTrigger>
</TabsList>

            <TabsContent value="feed">
              <div className="space-y-6 w-full mx-auto justify-center items-center">
                {isOwnProfile && <FeedComposer />}
                <FeedList userId={profile._id} />
              </div>
            </TabsContent>

            <TabsContent value="content">
              <UserImageGrid images={initialImages} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
