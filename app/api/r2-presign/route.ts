// app/api/r2-presign/route.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
})

export async function POST(req: NextRequest) {
  const { filename, filetype } = await req.json()

  const key = `${uuidv4()}-${filename}`

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME!,
    Key: key,
    ContentType: filetype,
  })

  const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 }) // 1 hr

  const publicUrl = `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.CLOUDFLARE_BUCKET_NAME}/${key}`

  return NextResponse.json({
    signedUrl,
    publicUrl,
    key,
  })
}
