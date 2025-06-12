// app/auth/forgot-password/page.tsx
'use client'

import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()
    if (res.ok) {
      setSubmitted(true)
    } else {
      setError(data.error || 'Something went wrong.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md w-full max-w-md space-y-4 border dark:border-gray-800"
      >
        <h1 className="text-xl font-bold text-center text-gray-800 dark:text-white">Reset your password</h1>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
          Enter the email associated with your Powerful account
        </p>

        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && <p className="text-sm text-red-500">{error}</p>}
        {submitted ? (
          <p className="text-green-600 text-sm text-center">
            ✅ Check your inbox! A reset link has been sent.
          </p>
        ) : (
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition"
          >
            Send Reset Link
          </button>
        )}
      </form>
    </div>
  )
}
