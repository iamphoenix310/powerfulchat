import { client, urlFor } from "@/app/utils/sanityClient";
import UserProfileClient from "@/components/User/MainPage";
import { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  try {
    const user = await client.fetch(
      `*[_type == "user" && username == $username][0]{
        username,
        bio,
        profileImage
      }`,
      { username }
    );

    if (!user) {
      return {
        title: "User Not Found",
        description: "This user does not exist on Powerful.",
      };
    }

    const ogImage = user.profileImage?.asset
      ? urlFor(user.profileImage, { width: 1200, height: 630 })
      : "https://visitpowerful.com/default-og-image.jpg";

    const title = `${user.username} on Powerful`;
    const description = user.bio || "Explore this creator profile on Powerful.";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "profile",
        url: `https://visitpowerful.com/users/${username}`,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: `${user.username}'s profile on Powerful`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [ogImage],
      },
    };
  } catch {
    return {
      title: "User Profile",
      description: "Unable to load user metadata.",
    };
  }
}

export default async function UserProfile({ params }: Props) {
  const { username } = await params;

  const user = await client.fetch(
    `*[_type == "user" && username == $username][0]{
      _id,
      username,
      email,
      verified,
      bio,
      profileImage,
      "followers": followers[]->_id,
      "following": following[]->_id,
      socialLinks
    }`,
    { username }
  );

  if (!user) {
    return <p className="text-center mt-10 text-gray-500">User not found.</p>;
  }

  const [initialFeed, initialImages] = await Promise.all([
    client.fetch(
      `*[_type == "userFeed" && author._ref == $userId] | order(createdAt desc){
        _id, text, createdAt, visibility, image,
        "likes": count(*[_type == "feedLike" && userFeed._ref == ^._id]),
        "initiallyLiked": false,
        author->{_id, username, profileImage}
      }`,
      { userId: user._id }
    ),
    client.fetch(
      `*[_type == "images" && creator._ref == $userId] | order(_updatedAt desc)`,
      { userId: user._id }
    ),
  ]);

  return (
    <div className="flex flex-col items-center justify-center">
      <UserProfileClient userData={user} initialImages={initialImages} />
    </div>
  );
}