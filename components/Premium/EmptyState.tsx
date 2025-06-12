import { SearchX } from "lucide-react"

interface EmptyStateProps {
  message?: string
  subMessage?: string
}

export default function EmptyState({
  message = "No premium content found",
  subMessage = "Try adjusting your search or filter criteria",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <SearchX className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-medium text-gray-700 mt-2">{message}</h3>
      <p className="text-gray-500 mt-2 max-w-md">{subMessage}</p>
    </div>
  )
}
