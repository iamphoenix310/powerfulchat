'use client';

import { client, urlFor } from '@/utils/sanityClient';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSelect?: (slug: string) => void;
  value?: string;
  onChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search images...',
  onSelect,
  value,
  onChange,
}) => {
  const [query, setQuery] = useState(value || '');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    if (onChange) {
      onChange(newValue);
    }

    if (newValue.length < 2) {
      setSearchResults([]);
      return;
    }

    setLoading(true);

    const searchQuery = `*[_type == "images" && (title match $query || description match $query || tags[] match $query)]{
      _id,
      title,
      slug,
      image
    }`;

    try {
      const results = await client.fetch(searchQuery, { query: `${newValue}*` } as Record<string, unknown>);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (slug: string) => {
    setQuery('');
    setSearchResults([]);

    if (onSelect) {
      onSelect(slug);
    } else {
      router.push(`/images/${slug}`);
    }
  };

  return (
    <div className="w-full">
      <div className="relative max-w-xl mx-auto mt-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={handleSearch}
          placeholder={placeholder}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-blue-600"
        />
      </div>

      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-4">Loading...</div>
      )}

      {searchResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2">
          {searchResults.map((image) => (
            <div
              key={image._id}
              onClick={() => handleSelect(image.slug.current)}
              className="cursor-pointer rounded overflow-hidden group bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition"
            >
              <Image
                src={urlFor(image.image) || "/placeholder.svg"}
                alt={image.title}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="p-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                {image.title}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
