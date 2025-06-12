import { NextResponse } from 'next/server'
import { getRemainingCount } from '@/app/lib/counterRemaining/count'

export async function GET() {
  const remaining = await getRemainingCount()
  return NextResponse.json({ remaining })
}
