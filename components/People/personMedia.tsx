// components/PersonMedia.tsx
import React from 'react';
import { FilmographyItem, TVShowItem, DiscographyItem } from './types';

interface PersonMediaProps {
  filmography: FilmographyItem[];
  tvShows: TVShowItem[];
  discography?: DiscographyItem[];
}

const PersonMedia: React.FC<PersonMediaProps> = ({ filmography, tvShows, discography }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Filmography</h2>
      {filmography.length > 0 ? (
        <ul className="list-disc pl-5">
          {filmography.map((item, index) => (
            <li key={index} className="mb-2">
              <strong>{item.title}</strong> ({item.releaseDate}) - {item.role}
            </li>
          ))}
        </ul>
      ) : (
        <p>No filmography available.</p>
      )}

      <h2 className="text-2xl font-bold mt-8 mb-4">TV Shows</h2>
      {tvShows.length > 0 ? (
        <ul className="list-disc pl-5">
          {tvShows.map((item, index) => (
            <li key={index} className="mb-2">
              <strong>{item.title}</strong> ({item.releaseDate}) - {item.role}
            </li>
          ))}
        </ul>
      ) : (
        <p>No TV shows available.</p>
      )}

      {discography && (
        <>
          <h2 className="text-2xl font-bold mt-8 mb-4">Discography</h2>
          {discography.length > 0 ? (
            <ul className="list-disc pl-5">
              {discography.map((item, index) => (
                <li key={index} className="mb-2">
                  <strong>{item.title}</strong> ({item.releaseDate}) - {item.type}
                </li>
              ))}
            </ul>
          ) : (
            <p>No discography available.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PersonMedia;