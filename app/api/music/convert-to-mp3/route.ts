import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPathPkg from 'ffmpeg-static'
import path, { join } from 'path'
import { tmpdir } from 'os'
import { createWriteStream, promises as fsPromises } from 'fs'
import { Readable } from 'stream'
import { client as sanityClient } from '@/app/utils/sanityClient'

const resolvedFFmpegPath =
  ffmpegPathPkg?.includes('.next')
    ? join(process.cwd(), 'node_modules/ffmpeg-static/ffmpeg')
    : ffmpegPathPkg ?? ''

ffmpeg.setFfmpegPath(resolvedFFmpegPath)

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_URL!, // ✅ use the same as .wav uploader
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_BUCKET_NAME!
const R2_BASE = process.env.CLOUDFLARE_R2_URL!

export async function POST(req: NextRequest) {
  try {
    const { wavFileUrl, documentId } = await req.json()
    console.log('[MP3] Starting conversion for doc:', documentId)
    console.log('[MP3] Original WAV URL:', wavFileUrl)

    if (!wavFileUrl || !documentId) {
      return NextResponse.json({ error: 'Missing wavFileUrl or documentId' }, { status: 400 })
    }

    // ✅ Extract key from full URL using base replacement
    const base = `${R2_BASE}/${BUCKET}/`
    const key = wavFileUrl.replace(base, '')
    console.log('[MP3] Resolved R2 key:', key)

    const signedUrl = await getSignedUrl(
      R2,
      new GetObjectCommand({ Bucket: BUCKET, Key: key }),
      { expiresIn: 300 }
    )
    console.log('[MP3] Signed fetch URL:', signedUrl)

    const response = await fetch(signedUrl)
    if (!response.ok) {
      console.error('[MP3] Failed to fetch WAV:', response.status)
      throw new Error('Failed to fetch WAV')
    }

    const wavBuffer = Buffer.from(await response.arrayBuffer())
    const tmpWavPath = path.join(tmpdir(), `${uuidv4()}.wav`)
    const tmpMp3Path = tmpWavPath.replace('.wav', '.mp3')

    console.log('[MP3] Writing temp WAV...')
    await new Promise<void>((resolve, reject) => {
      const stream = createWriteStream(tmpWavPath)
      stream.on('finish', () => {
        console.log('[MP3] .wav written ✅')
        resolve()
      })
      stream.on('error', reject)
      Readable.from(wavBuffer).pipe(stream)
    })

    console.log('[MP3] Converting to MP3...')
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tmpWavPath)
        .audioBitrate(320)
        .toFormat('mp3')
        .on('start', (cmd) => console.log('[FFMPEG] Command:', cmd))
        .on('end', () => {
          console.log('[MP3] FFmpeg conversion complete ✅')
          resolve()
        })
        .on('error', (err) => {
          console.error('[MP3] FFmpeg error:', err)
          reject(err)
        })
        .save(tmpMp3Path)
    })

    const mp3Buffer = await fsPromises.readFile(tmpMp3Path)
    const originalFileName = key.split('/').pop()?.replace('.wav', '') || uuidv4()
    const mp3Key = `converted-mp3/${originalFileName}.mp3`
    const mp3Url = `${R2_BASE}/${BUCKET}/${mp3Key}`


    console.log('[MP3] Uploading to R2...')
    try {
      await R2.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: mp3Key,
          Body: mp3Buffer,
          ContentType: 'audio/mpeg',
        })
      )
      console.log('[MP3] Upload successful ✅')
    } catch (uploadErr) {
      console.error('[MP3] Upload failed ❌', uploadErr)
      return NextResponse.json({ error: 'Upload to R2 failed' }, { status: 500 })
    }

    console.log('[MP3] Updating Sanity...')
    await sanityClient
      .patch(documentId)
      .set({ r2FileUrlmp3: mp3Url })
      .commit()
    console.log('[MP3] Sanity updated ✅')

    await fsPromises.unlink(tmpWavPath)
    await fsPromises.unlink(tmpMp3Path)
    console.log('[MP3] Temp files cleaned up ✅')

    return NextResponse.json({
      message: 'MP3 uploaded and saved to Sanity ✅',
      r2FileUrlmp3: mp3Url,
    })
  } catch (err) {
    console.error('[CONVERT TO MP3 ERROR]', err)
    return NextResponse.json({ error: 'MP3 conversion failed' }, { status: 500 })
  }
}
