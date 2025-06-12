// lib/tmdb.ts
import axios from 'axios';

export const fetchCelebrityData = async (tmdbId: string) => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY; // Store your TMDB API key in the environment
  const url = `https://api.themoviedb.org/3/person/${tmdbId}?api_key=${apiKey}&language=en-US`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from TheMovieDB:', error);
    return null;
  }
};

// Fetch film credits for a celebrity
export const fetchFilmCredits = async (tmdbId: string) => {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  const url = `https://api.themoviedb.org/3/person/${tmdbId}/movie_credits?api_key=${apiKey}&language=en-US`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching film credits from TheMovieDB:', error);
    return null;
  }
};