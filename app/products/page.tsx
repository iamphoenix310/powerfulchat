import { client } from "@/app/utils/sanityClient"
import ProductCard, { Product } from "@/components/Products/Display/ProductCard"
import type { Metadata } from 'next'


export const revalidate = 3 // ISR for fast updates

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: 'Products',
    description: 'Browse premium and free digital products on Powerful. Instantly downloadable assets for your creative and business needs.',
    openGraph: {
      title: 'All Products',
      description: 'Browse premium and free digital products on Powerful.',
      url: 'https://visitpowerful.com/products',
      siteName: 'Powerful',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'All Products',
      description: 'Explore our latest premium digital products.',
    },
  }
}



export default async function ProductsPage() {
 const products: Product[] = await client.fetch(`
  *[_type == "products" && !(_id in path("drafts.**")) && defined(slug.current) && status != "archived"]
  | order(publishedAt desc){
    _id,
    title,
    slug,
    mainimage,
    price,
    isPremium,
    description,
    productImages,
    freeWithSubscription
  }
`)
  return (
    <main className="max-w-7xl mx-auto px-2 sm:px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 tracking-tight">All Products</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <div className="text-center text-muted-foreground mt-16 text-lg">No products found.</div>
      )}
    </main>
  )
}
