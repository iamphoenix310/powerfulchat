import PremiumContent from "@/components/Premium/PremiumContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Premium Content",
  description: "Explore our exclusive premium content collection",
}

export default function PremiumPage() {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Premium Content</h1>
      <p className="text-center text-gray-600 mb-8">Discover our exclusive high-quality premium content</p>
      <PremiumContent />
    </div>
  )
}
