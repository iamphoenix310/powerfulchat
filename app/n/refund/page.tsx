// app/refund-policy/page.tsx
import { Metadata } from 'next'
import RefundPolicy from '@/components/Policies/Refund'



export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Understand our transparent refund timeline and conditions on Powerful.',
}

export default function RefundPolicyPage() {
  return <RefundPolicy />
}
