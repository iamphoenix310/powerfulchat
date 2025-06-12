// app/auth/reset/page.tsx
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useMemo } from 'react'


export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const token = useMemo(() => searchParams?.get('token') || '', [searchParams])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!token) {
      setError('Reset token is missing or invalid.')
      setLoading(false)
      return
    }

    if (password !== confirm) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })

    const data = await res.json()
    if (res.ok) {
      setSuccess(true)
      setTimeout(() => router.push('/auth?mode=login'), 2500)
    } else {
      setError(data.error || 'Something went wrong.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md space-y-5 border dark:border-gray-800"
      >
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white">
          Reset Your Password
        </h1>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && (
          <p className="text-sm text-green-600 text-center">
            ✅ Password reset! Redirecting to login...
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  )
}
