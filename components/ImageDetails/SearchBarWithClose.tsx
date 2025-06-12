'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import SearchBar from './searchBar'; // correct relative path

interface Props {
  onClose: () => void;
}

const SearchBarWithClose: React.FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const handleRedirect = (slug: string) => {
    router.push(`/images/${slug}`);
    onClose();
  };

  return <SearchBar onSelect={handleRedirect} />;
};

export default SearchBarWithClose;
