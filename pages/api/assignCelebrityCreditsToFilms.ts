import { client } from '@/app/utils/sanityClient';
import { fetchFilmCredits } from '@/lib/tmdb'; // Assuming fetchFilmCredits returns { cast: any[], crew: any[] } or similar
import { importFilmFromTmdb } from '@/scripts/movies/importFilmFromTmdb'; // Adjust path if needed
import { nanoid } from 'nanoid';

// --- Define FilmCredit interface directly in this file ---
interface FilmCredit {
  id: number; // This is the TMDB ID of the MOVIE
  title?: string; // Movie title
  character?: string; // Character played (for cast)
  job?: string; // Job (for crew, e.g., Director, Writer)
  department?: string; // Department (for crew, e.g., Directing, Writing)
  // Add any other relevant properties you expect from TMDB's cast/crew objects
  // For example:
  // poster_path?: string | null;
  // release_date?: string;
  // vote_average?: number;
  // overview?: string;
}
// --- End of FilmCredit interface definition ---

interface AssignCreditsParams {
  tmdbId: string; // Celebrity's TMDB ID
  sanityId: string; // Celebrity's Sanity Document ID
}

const patchFilmWithCelebrity = async ({
  filmSanityId,
  celebritySanityId,
  role,
  department,
}: {
  filmSanityId: string;
  celebritySanityId: string;
  role: string;
  department: string;
}) => {
  try {
    const film = await client.fetch(
      `*[_type == "films" && _id == $id][0]{ "credits": credits[]{ celebrity->{_id} } }`,
      { id: filmSanityId }
    );

    const alreadyLinked = film?.credits?.some(
      (c: any) => c.celebrity?._id === celebritySanityId
    );

    if (alreadyLinked) {
      console.log(`[patchFilmWithCelebrity] 🔁 Celebrity ${celebritySanityId} already linked to film ${filmSanityId}. Skipping.`);
      return;
    }

    await client
      .patch(filmSanityId)
      .setIfMissing({ credits: [] })
      .append('credits', [
        {
          _type: 'filmCredit', // Matches your Sanity schema type for the array item in films.credits
          _key: nanoid(),
          celebrity: { _type: 'reference', _ref: celebritySanityId },
          role,
          department,
        },
      ])
      .commit({ autoGenerateArrayKeys: true });

    console.log(`[patchFilmWithCelebrity] ✅ Linked celebrity ${celebritySanityId} to film ${filmSanityId} (Role: ${role})`);
  } catch (error) {
    console.error(`[patchFilmWithCelebrity] ❌ Error linking celebrity ${celebritySanityId} to film ${filmSanityId}:`, error);
  }
};

const patchCelebrityWithFilm = async ({
  celebritySanityId,
  filmSanityId,
  role,
}: {
  celebritySanityId: string;
  filmSanityId: string;
  role: string;
}) => {
  try {
    const celebrity = await client.fetch(
      `*[_type == "facesCelebs" && _id == $id][0]{ "credits": credits[]{ film->{_id} } }`,
      { id: celebritySanityId }
    );

    const alreadyLinked = celebrity?.credits?.some(
      (c: any) => c.film?._ref === filmSanityId || c.film?._id === filmSanityId
    );

    if (alreadyLinked) {
      console.log(`[patchCelebrityWithFilm] 🔁 Film ${filmSanityId} already linked to celebrity ${celebritySanityId}. Skipping.`);
      return;
    }

    await client
      .patch(celebritySanityId)
      .setIfMissing({ credits: [] }) // Assuming 'credits' is the array field in 'facesCelebs'
      .append('credits', [
        {
          _type: 'celebrityFilmCredit', // Matches your Sanity schema type for the array item in facesCelebs.credits
          _key: nanoid(),
          film: { _type: 'reference', _ref: filmSanityId },
          role,
        },
      ])
      .commit({ autoGenerateArrayKeys: true });

    console.log(`[patchCelebrityWithFilm] ✅ Linked film ${filmSanityId} to celebrity ${celebritySanityId} (Role: ${role})`);
  } catch (error) {
    console.error(`[patchCelebrityWithFilm] ❌ Error linking film ${filmSanityId} to celebrity ${celebritySanityId}:`, error);
  }
};

export const assignCelebrityCreditsToFilms = async ({
  tmdbId: celebrityTmdbId,
  sanityId: celebritySanityId,
}: AssignCreditsParams) => {

  // Ensure fetchFilmCredits returns an object like { cast: FilmCredit[], crew: FilmCredit[] } | null
  const creditsData = await fetchFilmCredits(celebrityTmdbId);

  if (!creditsData) {
    return;
  }

  const filmography: FilmCredit[] = [
    ...(creditsData.cast || []),
    ...(creditsData.crew || []),
  ];

  if (filmography.length === 0) {
   
    return;
  }

  console.log(`[assignCelebrityCreditsToFilms] Processing ${filmography.length} film credits for celebrity TMDB ID: ${celebrityTmdbId}.`);

  for (const filmCredit of filmography) {
    const filmTmdbMovieId = filmCredit.id;

    if (!filmTmdbMovieId) {
      continue;
    }

    const filmTmdbMovieIdStr = filmTmdbMovieId.toString();

    try {
      let filmSanityId: string | undefined;

      const existingFilm = await client.fetch<{ _id: string } | null>(
        `*[_type == "films" && tmdbId == $tmdbId][0]{ _id }`,
        { tmdbId: Number(filmTmdbMovieIdStr) }
      );

      filmSanityId = existingFilm?._id;

      if (!filmSanityId) {
const importResult = await importFilmFromTmdb(filmTmdbMovieIdStr);
filmSanityId = importResult?._id;

if (!filmSanityId) {
  console.warn(`⚠️ Failed to import film for TMDB ID ${filmTmdbMovieIdStr}`);
  continue;
}


  if (importResult?.title) {
    // retry fetching the film with exponential fallback
        for (let attempt = 0; attempt < 5; attempt++) {
          const reFetched = await client.fetch<{ _id: string } | null>(
            `*[_type == "films" && tmdbId == $tmdbId][0]{ _id }`,
            { tmdbId: Number(filmTmdbMovieIdStr) }
          );

          if (reFetched?._id) {
            filmSanityId = reFetched._id;
            break;
          }
          await new Promise((res) => setTimeout(res, 300 + attempt * 200)); // increasing delay
        }

        if (!filmSanityId) {
          continue;
        }
      } else {
        continue;
      }
    }


      if (!filmSanityId) {
        console.warn(`[assignCelebrityCreditsToFilms] ⚠️ Could not determine Sanity ID for film with TMDB ID ${filmTmdbMovieIdStr} after import attempt. Skipping linking.`);
        continue;
      }

      const role = filmCredit.character || filmCredit.job || 'Unknown';
      const department = filmCredit.department || (filmCredit.character ? 'Acting' : (filmCredit.job ? 'Production' : 'Unknown'));

      await patchFilmWithCelebrity({ filmSanityId, celebritySanityId, role, department });
      await patchCelebrityWithFilm({ celebritySanityId, filmSanityId, role });

    } catch (err) {

    }
  }

};