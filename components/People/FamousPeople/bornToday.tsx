'use client';

import { client, urlFor } from '@/app/utils/sanityClient';
import AdBlock from '@/components/Ads/AdBlock';
import PowerMeter from '@/components/People/powerMeter';
import { Gift, Sparkles, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const BornToday: React.FC<{ limit?: number }> = ({ limit = 24 }) => {
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPeople = async () => {
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');

      const query = `*[_type == "facesCelebs" && !(_id in path("drafts.**")) && dob match "*-${month}-${day}"] | order(_updatedAt desc) { _id, name, slug, profession, dob, powerMeter, image, ethnicity }`;

      try {
        const result = await client.fetch(query);
        setPeople(result);
      } catch (error) {
        console.error("Error fetching people:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPeople();
  }, []);

  const filteredPeopleToday = people.filter(person => {
    const dob = new Date(person.dob);
    const today = new Date();
    return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
      <AdBlock adSlot="8397118667" className="my-6" />

      {/* SEO/Intro Block */}
      <div className="mb-8 mt-8">
        <h1 className="flex items-center text-3xl font-bold gap-2 mb-2 text-left">
          <Sparkles className="w-7 h-7 text-yellow-500" />
          Famous People Born Today – Discover Today&apos;s Celebrity Birthdays
        </h1>
        <p className="text-base mb-3 text-left text-gray-700 dark:text-gray-300">
          Welcome to your ultimate source for <b>famous people born today</b>! If you&apos;re curious about which celebrities, notable figures, or historical personalities share a birthday with you, you&apos;ve come to the right place.
        </p>
        <p className="text-base mb-3 text-left text-gray-700 dark:text-gray-300">
          Every day, millions search online to find out <b>who was born today</b>, and we&apos;re here to answer precisely that. Our database updates daily, offering you the most accurate list of <b>celebrities born today</b>, including actors, musicians, athletes, historical figures, and more.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Who Was Born Today?</span>
        </div>
        <p className="text-base mb-3 text-left text-gray-700 dark:text-gray-300">
          Below, explore our handpicked selection of <b>famous people born today</b>. Click through to learn more about their achievements, life stories, and interesting facts that make each person uniquely remarkable.
        </p>
        <div className="flex items-center gap-2 mb-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">Today&apos;s Celebrity Birthdays</span>
        </div>
        <p className="text-base text-left text-gray-700 dark:text-gray-300">
          Each entry is carefully curated, providing insights such as birthdate, profession, and our exclusive &quot;Power Meter,&quot; gauging their popularity and influence. Dive in and explore!
        </p>
      </div>

      <AdBlock adSlot="8397118667" className="my-6" />

      {/* People Grid */}
      {filteredPeopleToday.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-4">
          {filteredPeopleToday.map((person) => (
            <div
              key={person._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-900"
            >
              <Link href={`/people/${person.slug.current}`}>
                <div className="relative w-full pb-[150%]">
                  <Image
                    src={person.image ? urlFor(person.image) : '/profile-pic.jpg'}
                    alt={person.name}
                    unoptimized
                    layout="fill"
                    className="absolute top-0 left-0 object-cover"
                  />
                </div>
              </Link>
              <div className="p-3">
                <h3 className="text-sm font-semibold mb-1 text-left text-gray-900 dark:text-gray-100">
                  <Link href={`/people/${person.slug.current}`}>{person.name}</Link>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Born: {new Date(person.dob).toLocaleDateString()}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-left">
                  {person.profession && Array.isArray(person.profession)
                    ? person.profession.slice(0, 3).join(', ')
                    : ''}
                </p>
                <div className="text-xs text-left text-gray-700 dark:text-gray-300">
                  <span className="italic">Power Meter:</span>
                  <PowerMeter value={person.powerMeter} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xl font-semibold text-left mt-8 text-gray-800 dark:text-gray-200">
          Looks like no famous birthdays today—check back tomorrow!
        </div>
      )}
    </div>
  );
};

export default BornToday;
