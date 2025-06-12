// app/api/r2-download/route.ts
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'

const CLOUDFLARE_BUCKET_NAME = process.env.CLOUDFLARE_BUCKET_NAME!
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID!
const CLOUDFLARE_R2_ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY!
const CLOUDFLARE_R2_SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY!

if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_R2_ACCESS_KEY || !CLOUDFLARE_R2_SECRET_KEY) {
  console.error("❌ Missing required R2 environment variables.")
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
    

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing key' }, { status: 400 })
    }

    const command = new GetObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 300 })
    

    return NextResponse.json({ signedUrl })
  } catch (err: any) {
  
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 })
  }
}
