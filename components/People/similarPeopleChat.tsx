"use client";

import { useEffect, useState } from "react";
import { client, urlFor } from "@/app/utils/sanityClient";
import Link from "next/link";
import Image from "next/image";

interface Slug {
  current: string;
}

interface PersonMain {
  _id: string;
  name: string;
  profession: string[];
  image: string;
  slug: Slug;
  powerMeter: number;
  country: string;
  gender: string;
}

interface SimilarPeopleProps {
  profession: string[];
  currentPersonId: string;
  country: string;
  gender: string;
}

const SimilarPeople: React.FC<SimilarPeopleProps> = ({
  profession,
  currentPersonId,
  country,
  gender,
}) => {
  const [similarPeople, setSimilarPeople] = useState<PersonMain[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSimilarPeople = async () => {
      try {
        const professionConditions = profession
          .map((p) => `profession match "${p}"`)
          .join(" || ");

        const query = `*[_type == "facesCelebs" && _id != $currentPersonId && (${professionConditions}) && country == $country && gender == $gender][0...6] | order(_createdAt desc){
          _id,
          name,
          profession,
          image,
          slug,
          powerMeter,
          country,
          gender
        }`;

        const result = await client.fetch(query, {
          currentPersonId,
          country,
          gender,
        });

        if (result.length === 0) {
          setError("No similar people found.");
        } else {
          // Shuffle the results for randomness
          const shuffledResults = result.sort(() => 0.5 - Math.random());
          setSimilarPeople(shuffledResults);
        }
      } catch (err) {
        console.error("Failed to fetch similar people:", err);
        setError("Error fetching similar people.");
      }
    };

    fetchSimilarPeople();
  }, [profession, currentPersonId, country, gender]);

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (similarPeople.length === 0) {
    return <p className="text-gray-500">No similar people found.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-1 mt-8">
      <h2 className="text-2xl font-bold mb-6">Similar People</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
        {similarPeople.map((person) => (
          <Link key={person._id} href={`/people/${person.slug.current}/chat`}>
            <div className="flex flex-col items-center p-1 border border-gray-200  shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <div className="relative w-full pb-[150%]">
                <Image
                  src={person.image ? urlFor(person.image) : '/profile-pic.jpg'}
                  alt={person.name}
                  layout="fill"
                  unoptimized={true}
                  className="absolute top-0 left-0 w-full h-full object-cover "
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-sm font-semibold mb-2 break-words">
                  {person.name}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SimilarPeople;