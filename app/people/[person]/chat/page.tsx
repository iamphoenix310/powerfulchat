import ChatBox from "@/components/People/ChatBox";
import ShareButtons from "@/components/SocialShare/socialShares";
import SimilarPeopleChat from "@/components/SocialShare/similarPeopleChat";
import { client, urlFor } from "@/app/utils/sanityClient";
import { Metadata } from "next";

interface ChatPageProps {
  params: { person: string };
}

// Fetch person details before rendering metadata
export async function generateMetadata({ params }: ChatPageProps): Promise<Metadata> {
  const { person } = params;

  const query = `*[_type == "facesCelebs" && slug.current == $slug][0] { name, image, profession, country, gender, _id }`;
  const personData = await client.fetch(query, { slug: person });

  if (!personData) {
    return {
      title: "Person Not Found",
      description: "This person does not exist in our database.",
    };
  }

  const chatUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/${person}/chat/`;
  const imageUrl = personData.image ? urlFor(personData.image) : "/default-avatar.png";

  return {
    title: `Chat About ${personData.name}`,
    description: `Join the discussion about ${personData.name}. Share opinions, ask questions, and explore their life and career.`,
    openGraph: {
      title: `Chat About ${personData.name}`,
      description: `Join the discussion about ${personData.name}.`,
      url: chatUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `Image of ${personData.name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Chat About ${personData.name}`,
      description: `Join the discussion about ${personData.name}.`,
      images: [imageUrl],
    },
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { person } = params;

  // Fetch person details
  const query = `*[_type == "facesCelebs" && slug.current == $slug][0] { name, image, profession, country, gender, _id }`;
  const personData = await client.fetch(query, { slug: person });

  if (!personData) {
    return <div className="text-center mt-10 text-xl font-semibold">Person not found.</div>;
  }

  const chatUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/people/${person}/chat`;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Chat About {personData.name}
      </h1>

      <ChatBox
        person={person}
        personName={personData.name}
        personImage={personData.image ? urlFor(personData.image) : "/default-avatar.png"}
      />


      {/* Fixed: Share Button Uses Full URL */}
      <ShareButtons shareUrl={chatUrl} title={`Chat About ${personData.name}`} />

      {/* Similar People Section */}
      <SimilarPeopleChat
        personId={personData._id}
        profession={personData.profession}
        country={personData.country}
        gender={personData.gender}
      />
    </div>
  );
}