export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="w-8 h-8 border-4 border-gray-300 border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="ml-3 text-gray-600 font-medium">Loading...</span>
    </div>
  )
}
