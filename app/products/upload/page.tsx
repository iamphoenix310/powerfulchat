import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"
import ProductUploadForm from "@/components/Products/UploadProducts/ProductUpload"
import { redirect } from "next/navigation"

export default async function ProductUploadMain() {
  const session = await getServerSession(authOptions)
  const role = (session?.user as any)?.role

  if (!session || role !== "admin") {
    redirect("/") // 🚫 or to a custom /unauthorized page
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
        Upload New Product
      </h1>
      <div className="bg-white dark:bg-[#1e1e1e] shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <ProductUploadForm />
      </div>
    </div>
  )
}
