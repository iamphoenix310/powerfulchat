import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const {
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_R2_ACCESS_KEY,
  CLOUDFLARE_R2_SECRET_KEY
} = process.env

if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY) {
  throw new Error('❌ Missing required R2 env variables')
}

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: CLOUDFLARE_R2_SECRET_KEY,
  },
})

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json()
    return await generateSignedUrl(key)
  } catch (err) {
    console.error('[SIGNED URL ERROR]', err)
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  return await generateSignedUrl(key)
}

async function generateSignedUrl(key: string | null) {
  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid key' }, { status: 400 })
  }

  try {
    const command = new GetObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 }) // 5 minutes

    return NextResponse.json({ signedUrl })
  } catch (err) {
    console.error('[R2 SIGNED URL ERROR]', err)
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }
}
