import { toast } from 'react-hot-toast'

export async function fetchStreamingUrlForTrack(fileUrl: string): Promise<string | null> {
  if (!fileUrl) {
    toast.error('No audio file available.')
    return null
  }

  try {
    const key = fileUrl.split('/').slice(4).join('/')

    const res = await fetch('/api/r2-music-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })

    const data = await res.json()

    if (res.ok && data?.signedUrl) {
      return data.signedUrl
    } else {
      toast.error('Failed to load audio stream.')
      return null
    }
  } catch (err) {
    console.error('❌ Error fetching stream URL:', err)
    toast.error('Audio playback failed.')
    return null
  }
}
