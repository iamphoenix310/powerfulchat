import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { client, urlFor } from '@/app/utils/sanityClient';

interface Celebrity {
  _id: string;
  name: string;
  slug: { current: string };
  image: { asset: { url: string } };
}

const CelebritySearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Celebrity[]>([]);

  useEffect(() => {
    const handleSearch = async () => {
      if (query.trim()) {
        const queryText = `*[_type == "facesCelebs" && name match "${query}*"]{_id, name, slug, image}`;
        const results = await client.fetch(queryText);
        setResults(results);
      } else {
        setResults([]);
      }
    };

    handleSearch();
  }, [query]);

  const handleResultClick = () => {
    setQuery(''); // Clear the input field
  };

  return (
    <div className="w-full max-w-[90%] mx-auto mt-6 px-4">
      <div className="flex items-center justify-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for Powerful..."
          className="w-full max-w-[80%] p-3 border text-base border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        />
      </div>
      <div className="mt-5 flex flex-col gap-6">
        {results.length > 0 ? (
          results.map((celebrity) => (
            <div key={celebrity._id} className="flex items-center space-x-4">
              <div className="relative w-16 h-16">
                <Image
                  src={urlFor(celebrity.image) || '/profile-pic.jpg'}
                  alt={celebrity.name}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-full"
                />
              </div>
              <Link href={`/people/${celebrity.slug.current}`}>
                <p onClick={handleResultClick} className="text-lg font-semibold hover:underline">
                  {celebrity.name}
                </p>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-gray-500"></p>
        )}
      </div>
    </div>
  );
};

export default CelebritySearch;