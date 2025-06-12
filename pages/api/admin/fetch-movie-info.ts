import { getToken } from 'next-auth/jwt'
import type { NextApiRequest, NextApiResponse } from 'next'
import { importFilmFromTmdb } from '@/scripts/films/importFilmFromTmdb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

  if (!token || token.role !== 'admin') {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { tmdbId } = req.body
    if (!tmdbId) return res.status(400).json({ message: 'Missing TMDB ID' })

    const result = await importFilmFromTmdb(tmdbId)
    return res.status(200).json({ message: 'Success', result })
  } catch (err) {
    console.error('❌ fetch-movie-info error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
}
