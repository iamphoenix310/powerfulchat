// types.ts
export interface FilmographyItem {
  title: string;
  releaseDate: string;
  role: string;
}

export interface TVShowItem {
  title: string;
  releaseDate: string;
  role: string;
}

export interface DiscographyItem {
  title: string;
  releaseDate: string;
  type: 'Album' | 'Single';
}