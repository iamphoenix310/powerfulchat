import { client, urlFor } from "@/app/utils/sanityClient"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProductDetailClient from "@/components/Products/Display/ProductDetailClient"

export const revalidate = 0

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await client.fetch(
    `*[_type == "products" && slug.current == $slug][0]{
      title,
      description,
      mainimage
    }`,
    { slug: params.slug }
  )

  if (!product) return {}

  return {
    title: product.title,
    description: product.description || "Explore premium digital products on Powerful.",
    openGraph: {
      title: product.title,
      description: product.description || "Explore premium digital products on Powerful.",
      images: [
        {
          url: urlFor(product.mainimage),
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: product.description || "Explore premium digital products on Powerful.",
      images: [urlFor(product.mainimage)],
    },
  }
}


export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await client.fetch(
    `*[_type == "products" && slug.current == $slug][0]{
      _id,
      title,
      slug,
      description,
      price,
      body,
      isPremium,
      mainimage,
      productImages,
      freeWithSubscription,
      attachedFiles,
      unlockAfterPurchase,
      tags,
      creator->{_id, username, email, image}
    }`,
    { slug: params.slug }
  )

  if (!product) return notFound()

  return <ProductDetailClient product={product} />
}
