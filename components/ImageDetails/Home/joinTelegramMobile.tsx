'use client'

import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function JoinTelegramMobile() {
  return (
    <div className="block md:hidden my-3 mx-4 rounded-lg border border-blue-500 bg-gradient-to-r from-blue-950 via-blue-900 to-blue-950 px-3 py-2 text-white shadow hover:shadow-blue-500/20 transition-all">
      <div className="flex items-center justify-between gap-2">
        {/* Icon */}
        <div className="bg-blue-600 rounded-full p-1 shadow shadow-blue-400/40">
          <PaperAirplaneIcon className="w-4 h-4 text-white rotate-45" />
        </div>

        {/* Label */}
        <p className="text-xs font-medium text-white">Telegram Group</p>

        {/* Button */}
        <Link
          href="https://t.me/powerfulcrea"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-[11px] px-3 py-1 rounded-md bg-blue-600 hover:bg-blue-700 transition"
        >
          Join →
        </Link>
      </div>
    </div>
  )
}
