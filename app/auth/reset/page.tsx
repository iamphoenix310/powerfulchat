// app/auth/reset/page.tsx

import ResetPasswordForm from '@/components/Auth/ResetPasswordForm'

export default function ResetPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <ResetPasswordForm />
    </div>
  )
}
export const dynamic = 'force-dynamic'
