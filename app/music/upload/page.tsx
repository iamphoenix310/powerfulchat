'use client'

import { useSession } from 'next-auth/react'
import UploadAlbumWithSongs from '@/components/Music/Upload/UploadAlbumWithSongs'
import UploadSongForm from '@/components/Music/Upload/UploadSongForm'
import LyricsUploader from '@/components/Music/Upload/UploadLyrics'

export default function UploadMusicPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <div className="p-4 text-center">Checking permissions...</div>
  }

  if (!session || session.user?.role !== 'admin') {
    return <div className="p-4 text-center text-red-500">Access denied: Admins only.</div>
  }

  return (
    <div className="p-6 space-y-10 w-full max-w-3xl mx-auto">
      <UploadAlbumWithSongs />
      <hr className="my-10 border-t" />
      <LyricsUploader  />
      <hr className="my-10 border-t" />
      <UploadSongForm />
    </div>
  )
}
