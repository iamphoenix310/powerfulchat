'use client'

import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function JoinTelegramDesktop() {
  return (
    <div className="hidden md:block my-10 w-full max-w-3xl mx-auto rounded-2xl border border-blue-500 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 p-6 text-white shadow-xl hover:shadow-blue-500/40 transition-all">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 rounded-full p-3 shadow-lg shadow-blue-400/40">
          <PaperAirplaneIcon className="w-6 h-6 text-white rotate-45" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold tracking-wide">Join Our Powerful Telegram Group</h3>
          <p className="text-sm md:text-base text-blue-100 mt-1">
            Get exclusive updates, share your creations, and connect with the creative community.
          </p>
        </div>
        <Link
          href="https://t.me/powerfulcrea"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-xl transition-colors"
        >
          Join Now →
        </Link>
      </div>
    </div>
  )
}
