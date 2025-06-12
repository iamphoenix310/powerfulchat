'use client'

export default function Loader() {
  return (
    <div className="fixed top-3 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur shadow-lg">
        <div className="w-4 h-4 rounded-full bg-gray-500 animate-ping" />
        <div className="w-4 h-4 rounded-full bg-gray-600 animate-pulse" />
        <span className="text-sm font-medium text-gray-700">Refreshing...</span>
      </div>
    </div>
  )
}