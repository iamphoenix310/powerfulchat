import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const R2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_URL, // e.g. https://<accountid>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

const BUCKET = process.env.CLOUDFLARE_BUCKET_NAME!

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filename = searchParams.get('filename')

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 })
    }

    const buffer = await req.arrayBuffer()

    await R2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: filename,
        Body: Buffer.from(buffer),
        ContentType: 'audio/wav', // or 'audio/x-wav' if needed
        // ACL removed — using signed URLs now
      })
    )

    const fileUrl = `${process.env.CLOUDFLARE_R2_URL}/${BUCKET}/${filename}`

    return NextResponse.json({ url: fileUrl })
  } catch (err) {
    console.error('[R2 UPLOAD ERROR]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
