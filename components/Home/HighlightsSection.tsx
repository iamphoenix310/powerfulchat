"use client"

import {
  ImageDown,
  Sparkles,
  UploadCloud,
  UsersRound,
  MessageSquare,
} from "lucide-react"

const features = [
  {
    title: "Download High Quality Images for Free",
    description:
      "Explore thousands of stunning, royalty-free images uploaded by top creators.",
    icon: ImageDown,
  },
  {
    title: "Create AI-Generated Images via Prompts",
    description:
      "Turn your imagination into art using our cutting-edge image generator.",
    icon: Sparkles,
  },
  {
    title: "Upload and Sell Your Digital Files",
    description: "Monetize your images, PDFs, and zip files securely.",
    icon: UploadCloud,
  },
  {
    title: "Follow Creators You Love",
    description:
      "Build your own feed by following artists, photographers, and designers.",
    icon: UsersRound,
  },
  {
    title: "Post Text & Image Updates",
    description:
      "Stay connected with your audience through real-time text and image posts.",
    icon: MessageSquare,
  },
]

export default function HighlightsSection() {
  return (
    <section className="py-20 px-4 max-w-6xl mx-auto text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-14 text-neutral-900">
        What You Can Do on <span className="text-primary">VisitPowerful.com</span>
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/10 text-primary p-3 rounded-full group-hover:scale-105 transition">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title}
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
