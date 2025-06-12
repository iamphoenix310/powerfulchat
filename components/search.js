// components/Search.js
import { useState } from 'react';
import Link from 'next/link';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query) return;

    const response = await fetch(`/api/search?q=${query}`);
    const data = await response.json();
    console.log(data);
    setResults(data);
  };

  const getUrl = (item) => {
    switch (item._type) {
      case 'images': return `/images/${item.slug}`;
      case 'stories': return `/stories/${item.slug}`;
      case 'wallpaper':
      const category = item.category || 'default-category'; // Replace 'default-category' with a suitable default
      return `/wallpapers/${category}/${item.slug}`;
      case 'products': return `/products/planners/${item.slug}`;
      default: return '/';
    }
  };

  return (
    <div className="max-w-md mx-auto my-10">
      <form onSubmit={handleSearch} className="flex items-center border-b border-teal-500 py-2">
        <input
          className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
        />
        <button 
          className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
          type="submit">
          Search
        </button>
      </form>
      <ul className="list-none mt-4">
        {results.map((item, index) => (
          <li key={index} className="mb-4">
            <Link href={getUrl(item)}>
              <span className="text-blue-500 hover:text-blue-800">{item.title}</span>
            </Link>
            
          </li>
        ))}
      </ul>
    </div>
  );
}
