import { client, urlFor } from "@/app/utils/sanityClient";
import PersonPage from "@/components/People/singlePerson";
import type { Metadata, ResolvingMetadata } from "next";

interface PersonProps {
  params: Promise<{ person: string }>;
}

export default async function SinglePerson({ params }: PersonProps) {
  const { person: slug } = await params; // Await params and destructure

  const personDetail = await client.fetch(
    `*[_type == "facesCelebs" && slug.current == $slug][0]`,
    { slug }
  );

  if (!personDetail) {
    return <div className="text-center py-10">Celebrity not found.</div>;
  }

  return (
    <>
      <PersonPage slug={slug} />
    </>
  );
}

export async function generateMetadata(
  { params }: PersonProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { person: slug } = await params; // Await params and destructure

  const personDetail = await client.fetch(
    `*[_type == "facesCelebs" && slug.current == $slug][0]`,
    { slug }
  );

  if (!personDetail) {
    return { title: "Person not found" };
  }

  return {
    title: `${personDetail.name} - Biography, Age, Ratings and More`,
    description: personDetail.metaDescription || `Explore biography and facts about ${personDetail.name}.`,
    alternates: {
      canonical: `/people/${personDetail.slug.current}`,
    },
    openGraph: {
      images: [
        {
          url: urlFor(personDetail.image),
          width: 700,
          height: 700,
          type: "image/png",
        },
      ],
      title: `${personDetail.name} - Biography, Age, Ratings and More`,
      description: personDetail.metaDescription,
      url: `https://visitpowerful.com/people/${personDetail.slug.current}`,
      siteName: "Powerful",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${personDetail.name} - Biography, Age, Ratings and More`,
      description: personDetail.metaDescription,
      creator: "@powerfulcreat",
      images: [
        {
          url: urlFor(personDetail.image),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}