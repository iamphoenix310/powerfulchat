import { client, urlFor } from "@/app/utils/sanityClient";
import ProductDetailClient from "@/components/Products/Display/ProductDetailClient";
import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 0;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params; // Await params and destructure

  const product = await client.fetch(
    `*[_type == "products" && slug.current == $slug][0]{
      title,
      description,
      mainimage
    }`,
    { slug }
  );

  if (!product) return {};

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
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params; // Await params and destructure

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
    { slug }
  );

  if (!product) return notFound();

  return <ProductDetailClient product={product} />;
}