// Same import block as before (unchanged)
'use client'

import { urlFor } from "@/app/utils/sanityClient"
import { LoginModal } from '@/components/GoogleLogin/LoginModel'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Eye, Loader2, Send, Smile, Star, Trophy, User, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"

interface Props {
  personId: string
  profession: string[]
  defaultValues?: Record<string, number>
  skillsOverride?: string[]
  personName: string
  image?: any 
  votedUsers?: {
    profileImage?: any;
    _id: string
    username?: string
    name?: string
  }[]
}

const LOOKS_ATTRIBUTES = [
  { key: "facerating", label: "Face", icon: User },
  { key: "eyesrating", label: "Eyes", icon: Eye },
  { key: "lipsrating", label: "Lips", icon: Smile },
  { key: "noserating", label: "Nose", icon: User },
  { key: "chinrating", label: "Chin", icon: User },
  { key: "foreheadrating", label: "Forehead", icon: User },
  { key: "cheeksrating", label: "Cheeks", icon: Smile },
]

const ALL_SKILL_OPTIONS: Record<string, string> = {
  actingrating: "Acting",
  voicerating: "Voice",
  modellingrating: "Modeling",
  dancingrating: "Dancing",
  singingrating: "Singing",
  writingrating: "Writing",
  directingrating: "Directing",
  cinematographyrating: "Cinematography",
  politicsrating: "Politics",
  hostingrating: "Hosting",
  debatingrating: "Debating",
  standuprating: "Comedy/Stand-Up",
  storytellingrating: "Storytelling",
}

const professionToSkills: Record<string, string[]> = {
  Actor: ["actingrating", "voicerating"],
  Actress: ["actingrating", "voicerating"],
  Singer: ["voicerating", "singingrating"],
  Model: ["modellingrating"],
  Dancer: ["dancingrating"],
  Director: ["directingrating"],
  Writer: ["writingrating", "storytellingrating"],
  Comedian: ["standuprating", "voicerating"],
  Politician: ["politicsrating", "debatingrating"],
  Leader: ["politicsrating"],
  Host: ["hostingrating"],
  Screenwriter: ["writingrating"],
  Cinematographer: ["cinematographyrating"],
  Rapper: ["voicerating", "singingrating"],
  Journalist: ["writingrating", "debatingrating"],
  Activist: ["debatingrating", "storytellingrating"],
  YouTuber: ["voicerating", "hostingrating"],
}

function getSkillsForProfessions(professions: string[]): string[] {
  const set = new Set<string>()
  professions.forEach((prof) => {
    const normalized = prof.trim()
    if (professionToSkills[normalized]) {
      professionToSkills[normalized].forEach((skill) => set.add(skill))
    }
  })
  return Array.from(set)
}

function getRatingColor(value: number): string {
  if (value >= 80) return "text-emerald-600"
  if (value >= 60) return "text-blue-600"
  if (value >= 40) return "text-yellow-600"
  if (value >= 20) return "text-orange-600"
  return "text-red-600"
}

function getRatingLabel(value: number): string {
  if (value >= 90) return "Exceptional"
  if (value >= 80) return "Excellent"
  if (value >= 70) return "Very Good"
  if (value >= 60) return "Good"
  if (value >= 50) return "Average"
  if (value >= 40) return "Below Average"
  if (value >= 30) return "Poor"
  return "Very Poor"
}

export default function PersonRatingSection({
  personId, profession, defaultValues = {}, skillsOverride, personName, image, votedUsers
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAllVoters, setShowAllVoters] = useState(false)

  const { data: session } = useSession()
  const skillKeys = skillsOverride?.length ? skillsOverride : getSkillsForProfessions(profession)
  const skillAttributes = skillKeys.map((key) => ({
    key,
    label: ALL_SKILL_OPTIONS[key] ?? key,
  }))

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {}
    ;[...LOOKS_ATTRIBUTES, ...skillAttributes].forEach(({ key }) => {
      initial[key] = defaultValues[key] ?? 50
    })
    return initial
  })

  const handleChange = (key: string, value: number[]) => {
    setRatings((prev) => ({ ...prev, [key]: value[0] }))
  }

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      setShowLoginModal(true)
      return
    }

    setIsSubmitting(true)
    try {
      const validRatings = Object.fromEntries(
        Object.entries(ratings).filter(([_, val]) => typeof val === "number")
      )

      const res = await fetch("/api/people/ratings/submit", {
        method: "POST",
        body: JSON.stringify({ personId, ratings: validRatings }),
        headers: { "Content-Type": "application/json" }
      })

      if (!res.ok) throw new Error("Failed")
      toast.success("Rating submitted successfully! 🎉")
    } catch (error) {
      toast.error("Something went wrong while submitting. Please try again.")
      console.error("🔥 Submit error", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const safeVotedUsers = votedUsers ?? []
  const visibleVoters = safeVotedUsers.filter(Boolean).slice(0, showAllVoters ? safeVotedUsers.length : 5)

  const averageLooksRating = Math.round(
    LOOKS_ATTRIBUTES.reduce((sum, { key }) => sum + ratings[key], 0) / LOOKS_ATTRIBUTES.length,
  )

  const averageSkillsRating =
    skillAttributes.length > 0
      ? Math.round(skillAttributes.reduce((sum, { key }) => sum + ratings[key], 0) / skillAttributes.length)
      : 0

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

      <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
        {/* Looks Rating */}
        <Card className="border-2 border-purple-100 dark:border-purple-900 bg-white dark:bg-slate-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6" />
              Rate {personName}&apos;s Looks
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
              {image && (
                <div className="relative mx-auto w-full max-w-[240px] aspect-[3/4] overflow-hidden rounded-lg border shadow-md lg:sticky lg:top-24">
                  <Image
                    src={urlFor(image)}
                    alt={personName}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 240px"
                    priority
                  />
                </div>
              )}
              <div className="grid gap-6">
                {LOOKS_ATTRIBUTES.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-purple-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-100">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getRatingColor(ratings[key])}`}>{ratings[key]}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 hidden sm:inline">{getRatingLabel(ratings[key])}</span>
                      </div>
                    </div>
                    <Slider
                      value={[ratings[key]]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(val) => handleChange(key, val)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Poor</span>
                      <span>Excellent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Rating */}
        {skillAttributes.length > 0 && (
          <Card className="border-2 border-blue-100 dark:border-blue-900 bg-white dark:bg-slate-900 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy className="w-6 h-6" />
                Rate {personName}&apos;s Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
                {skillAttributes.map(({ key, label }) => (
                  <div key={key} className="space-y-3 p-4 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-700 dark:text-gray-100">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getRatingColor(ratings[key])}`}>{ratings[key]}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-300 hidden sm:inline">{getRatingLabel(ratings[key])}</span>
                      </div>
                    </div>
                    <Slider
                      value={[ratings[key]]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={(val) => handleChange(key, val)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
                      <span>Beginner</span>
                      <span>Expert</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit */}
        <div className="text-center mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Ratings
              </>
            )}
          </Button>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Your feedback helps improve our community ratings
          </p>
        </div>
      </div>
    </>
  )
}
