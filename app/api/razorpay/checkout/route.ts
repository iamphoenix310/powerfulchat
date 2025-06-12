import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

export async function POST(req: Request) {
  const { planName, amount, credits } = await req.json()

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const options = {
    amount: amount * 100, // in paise
    currency: 'INR',
    receipt: `receipt_order_${Math.random() * 1000}`,
  }

  const order = await razorpay.orders.create(options)

  return NextResponse.json(order)
}
