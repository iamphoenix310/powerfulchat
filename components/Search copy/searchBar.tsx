'use client';

import React from 'react';
import AdBlock from '../Ads/AdBlock';


interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = "Search images..." }) => {
  return (
    <div className="sticky top-0 z-10 bg-white px-4 py-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 text-base"
        style={{ fontSize: "16px" }}
      />

      {/* ✅ AdSense below search input
      <div className="mt-4">
        <AdBlock adSlot="2013719979" className="mx-auto max-w-[728px]" />
      </div> */}
    </div>
  );
};

export default SearchBar;
