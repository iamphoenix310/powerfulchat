import { client } from '@/app/utils/sanityClient';
import { fetchFilmDataWithCredits } from '@/lib/tmdb/fetchFilmData';
import { processCelebrityData } from '@/pages/api/processCelebData';
import { getUniqueSlug } from '@/lib/getUniqueSlug';
import { nanoid } from 'nanoid';

interface CreditEntry {
  _key: string;
  celebrity: { _type: 'reference'; _ref: string };
  role: string;
  department: string;
}

export async function importFilmFromTmdb(tmdbId: number) {
  // 1. Check for existing film
  const existingFilm = await client.fetch(
    `*[_type == "films" && tmdbId == $tmdbId][0]`,
    { tmdbId }
  );

  // 2. Fetch TMDB data
  const tmdb = await fetchFilmDataWithCredits(tmdbId);
  if (!tmdb) throw new Error('TMDB data not found');

  // 3. Prepare film ID and slug
  const filmId = existingFilm?._id || `film-${nanoid()}`;
  const uniqueSlug = await getUniqueSlug(tmdb.slug, 'films');

  // 4. Prepare film base data
  const filmData = {
    title: tmdb.title,
    slug: { _type: 'slug', current: uniqueSlug },
    description: tmdb.overview,
    releaseDate: tmdb.release_date,
    runtime: tmdb.runtime,
    voteAverage: tmdb.vote_average,
    voteCount: tmdb.vote_count,
    imdbId: tmdb.imdb_id,
    tmdbId,
    trailerUrl: tmdb.youtubeTrailerUrl || '',
    genres: tmdb.genres || [],
    credits: [] // Start empty
  };

  // 5. Create or update the film (initially without credits)
  if (!existingFilm) {
    await client.create({ _id: filmId, _type: 'films', ...filmData });
  } else {
    await client
      .patch(filmId)
      .setIfMissing({ credits: [] })
      .set(filmData)
      .commit();
  }

  // 6. Process credits AFTER film exists
  const allCredits = [...tmdb.cast, ...tmdb.crew];
  const enrichedCredits: CreditEntry[] = [];
  const seen = new Set<string>();

  for (const person of allCredits) {
    const celeb = await processCelebrityData(String(person.id), {
      importBio: true,
      filmId // ✅ film is now guaranteed to exist
    });

    if (celeb?._id) {
      const uniqueKey = `${celeb._id}-${person.character || person.job}-${person.department}`;
      if (seen.has(uniqueKey)) continue;
      seen.add(uniqueKey);

      enrichedCredits.push({
        _key: nanoid(),
        celebrity: { _type: 'reference', _ref: celeb._id },
        role: person.character || person.job,
        department: person.department || 'Other'
      });
    }
  }

  // 7. Attach enriched credits
  await client.patch(filmId).set({ credits: enrichedCredits }).commit();

  // 8. Return the saved film
  return await client.fetch(`*[_type == "films" && _id == $id][0]`, {
    id: filmId
  });
}
