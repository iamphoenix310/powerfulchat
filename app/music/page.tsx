'use client'

import AdBlock from '@/components/Ads/AdBlock'
import MusicGrid from '@/components/Music/Display/MusicGrid'
import { Library, Music2 } from 'lucide-react'

export default function MusicPage() {
  return (
    <div className="px-4 py-8 max-w-6xl mx-auto space-y-10">
      <h2 className="text-2xl font-bold mb-4">Listen to Our Original Music</h2>

      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Library size={20} />
          Albums
        </h2>
        <MusicGrid type="album" />
      </section>
      <AdBlock adSlot="8397118667" className="my-8" />

      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Music2 size={20} />
          Singles
        </h2>
        <MusicGrid type="single" />
      </section>

      <AdBlock adSlot="9995634858" className="my-8" />
    </div>
  )
}
