'use client'

import Link from 'next/link'

export const LoginModal = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[90%] max-w-md transition-all">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 text-center">
          🔐 Authentication Required
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 text-center">
          You need to be logged in to continue. Please sign in or sign up from the auth page.
        </p>
        <div className="space-y-4">
          <Link
            href="/auth"
            className="block w-full text-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all duration-200 hover:scale-105"
          >
            🚀 Go to Login / Sign Up
          </Link>
          <button
            onClick={onClose}
            className="w-full border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-full transition-all duration-200"
          >
            ✖ Close
          </button>
        </div>
      </div>
    </div>
  )
}