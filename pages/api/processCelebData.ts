import { fetchCelebrityData } from './tmdb';
import { uploadImageToSanity } from './imageUpload';
import { client } from '@/app/utils/sanityClient';
import { markdownToPortableText as parseMarkdownToPT } from '@/utils/markdownToPortableText';
import { assignCelebrityCreditsToFilms } from './assignCelebrityCreditsToFilms';
import { nanoid } from 'nanoid';

interface CelebrityData {
  name: string;
  dob: string;
  country: string;
  intro: any[];
  image: any;
  metaDescription: string;
  profession: string[];
  ethnicity?: string[];
  eyeColor?: string;
  hairColor?: string;
  height?: string;
  bodyType?: string;
  slug: {
    _type: 'slug';
    current: string;
  };
  powerMeter: number;
  gender: string;
  isDead?: boolean;
  deathDate?: Date;
  expandedBiography?: any[];
  seoKeywords?: string[];
  seoContentBlocks?: Array<{ keyword: string; answer: string }>;
  tmdbId: number;
}

const checkIfCelebrityExists = async (name: string) => {
  const query = `*[_type == "facesCelebs" && name == $name][0] { _id, name }`;
  return await client.fetch(query, { name });
};

const fetchGeneratedInfo = async (name: string, infoType: string) => {
  try {
    const base =
      typeof window === 'undefined'
        ? process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        : '' // client can use relative path

    const response = await fetch(`${base}/api/generateCelebInfo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, infoType }),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.text?.trim() || '';
  } catch (error) {
    console.error(`[fetchGeneratedInfo] Failed for ${name} (${infoType})`, error);
    return '';
  }
};


const fetchJsonData = async <T>(name: string, prompt: string, key: string): Promise<T | null> => {
  const raw = await fetchGeneratedInfo(name, prompt);
  try {
    const cleaned = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed[key] ?? null;
  } catch {
    return null;
  }
};

const fetchDeathInfo = async (name: string, dob: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  try {
    const response = await fetch(`${baseUrl}/api/isPersonDead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personName: name, dob }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[fetchDeathInfo] HTTP error for ${name} (DOB: ${dob}): ${response.status} - ${errorText}`)
      return { isDead: false, deathDate: '' }
    }

    const data = await response.json()
    return { isDead: data.isDead || false, deathDate: data.deathDate || '' }
  } catch (error) {
    console.error(`[fetchDeathInfo] Error fetching death info for ${name} (DOB: ${dob}):`, error)
    return { isDead: false, deathDate: '' }
  }
}



export const processCelebrityData = async (
  tmdbId: string,
  options: { importBio?: boolean; importMoviesOnly?: boolean, filmId?: string;  } = {}
) => {
  const { importBio = true, importMoviesOnly = false } = options;
  const celebrityData = await fetchCelebrityData(tmdbId);
  if (!celebrityData) {
  console.error(`❌ TMDB returned null for celebrity ID: ${tmdbId}`);
  return null;
}
  const personTmdbId = String(celebrityData.id || tmdbId);

  if (!celebrityData || !celebrityData.profile_path) return null;

  const existing = await checkIfCelebrityExists(celebrityData.name);
  const name = celebrityData.name;
  const tmdbBiography = celebrityData.biography || '';

  const seoKeywordsPrompt = `You are an SEO expert. Based on public knowledge of ${name}, generate 7–10 high-intent SEO keywords or long-tail queries related to their career, achievements, and identity. Respond as {"seoKeywordsList": ["..."]}`;
  const placeOfBirthInfo = celebrityData.place_of_birth
    ? ` who is known to be from ${celebrityData.place_of_birth}`
    : '';

  const detailedBiographyMarkdownPrompt = `Act as an expert biographer and content creator for a high-quality online platform. Using the provided keywords, creatively and naturally incorporate them throughout the biography without disrupting flow or structure.
Write a comprehensive, detailed, SEO-optimized, and engaging biography of ${name}${placeOfBirthInfo}.
The biography should be informative. Use a neutral tone, avoiding speculation or unverified claims.
The biography should be well-structured using Markdown headings (e.g., '## Early Life and Education', '### Career Breakthrough', '## Philanthropic Work').
Ensure factual accuracy, relying on publicly available and verifiable information. Maintain a neutral, objective, yet captivating tone. Avoid speculation, excessive praise, or unconfirmed rumors. Do not invent information.
Cover the following aspects in detail, where applicable:
Cover the following aspects in detail, where applicable:
- ## Early Life and Background: Include birth date and place (if not already mentioned), family details (if public and relevant), upbringing, and education.
- ## Career Beginnings: Describe their initial foray into their profession(s), early projects, and formative experiences.
- ## Rise to Prominence / Major Career Milestones: Detail breakthrough roles/projects, significant achievements, and turning points in their career.
- ## Notable Works: Highlight the most important works the celebrity is known for.
- ## Awards and Recognition: Highlight major awards, nominations, and honors received.
- ## Personal Life: (Optional, handle with utmost discretion) Briefly touch upon publicly known aspects of their personal life, such as family or significant relationships, if widely reported and non-intrusive.
- ## Philanthropy, Activism, and Other Ventures: Detail any significant charitable work, activism, business ventures, or other notable interests outside their primary profession.
- ## Public Image and Influence: Discuss their public persona, cultural impact, and influence within their field and beyond.
- ## Legacy: Summarize their lasting impact and how they are likely to be remembered.
Aim for a substantial word count (e.g., 800-1500 words), prioritizing depth, quality, and relevance. The goal is a definitive and trustworthy resource. Ensure that all sections are present, even if brief. Do not skip any.
`;

if (existing?._id) {
  // Fetch existing data
  const existingData = await client.fetch(
    `*[_type == "facesCelebs" && _id == $id][0]{ _id, expandedBiography, intro, tmdbId }`,
    { id: existing._id }
  );

  const patch = client.patch(existing._id);

  // Only add expanded biography if missing
  if (importBio && !importMoviesOnly && (!existingData?.expandedBiography || existingData.expandedBiography.length === 0)) {
    const detailedMarkdown = await fetchGeneratedInfo(name, detailedBiographyMarkdownPrompt);
    const expandedPT = detailedMarkdown ? await parseMarkdownToPT(detailedMarkdown) : [];
    patch.set({ expandedBiography: expandedPT });
  }

  // Only add short intro if it's missing or malformed (avoid long bios in intro)
  if (importBio && (!existingData?.intro || existingData.intro.length === 0)) {
    const shortIntro = await fetchGeneratedInfo(name, `Write a single short paragraph (max 3 lines) introducing ${name}. Mention profession, country, and one highlight. Do not exceed 3 lines. No personal life or history.`);
    patch.set({
      intro: [
        {
          _key: 'introKey',
          _type: 'block',
          children: [{ _key: 'spanKey', _type: 'span', marks: [], text: shortIntro }],
          markDefs: [],
          style: 'normal',
        },
      ]
    });
  }

  // Add tmdbId if not yet stored
  if (!existingData?.tmdbId) {
    patch.set({ tmdbId: Number(personTmdbId) });
  }

  // Commit patch only if changes exist
  await patch.commit();

  // Always reassign credits if needed
  if (!importBio || importMoviesOnly) {
    await assignCelebrityCreditsToFilms({ tmdbId: personTmdbId, sanityId: existing._id });
  }

  return existing;
}


  const country = celebrityData.place_of_birth
    ? celebrityData.place_of_birth.split(',').pop()?.trim() || ''
    : await fetchGeneratedInfo(name, 'just tell the country name of this person');

  let dob = celebrityData.birthday || '';
  if (!dob) {
    dob = await fetchGeneratedInfo(
  name,
  `Respond only with the date of birth of ${name} in YYYY-MM-DD format. If unknown or not publicly available, return an empty string. Do not include explanations, apologies, or additional text.`
)
  }

  const genderMap: Record<number, string> = { 1: 'Female', 2: 'Male', 3: 'Non-binary', 0: 'Not Specified' };
  const genderString = genderMap[celebrityData.gender] || 'Not Specified';

  const professionsRaw = await fetchGeneratedInfo(name, `Provide a list of ${name}'s primary professions in a single line, comma-separated. Keep multi-word professions intact.`);
  const profession = professionsRaw
    ? professionsRaw.split(',').map((p: string) => p.trim()).filter(Boolean).map((p: string) => genderString === 'Female' && p.toLowerCase() === 'actor' ? 'Actress' : p)
    : [];

  const { isDead, deathDate } = await fetchDeathInfo(name, dob);

  const shortIntro = await fetchGeneratedInfo(name, `Write a single short paragraph (3 lines max) introducing ${name}. Mention their profession, notable work, and country. Do not exceed 3 lines. Do not include biography, life story, early life, or personal details.`);

  // ✅ These are declared only once, and filled conditionally
  let expandedBiographyPortableText: any[] = [];
  let preBioSeoKeywordList: string[] = [];
  let seoContentBlocks: Array<{ keyword: string; answer: string }> = [];

  if (importBio && !importMoviesOnly) {
    preBioSeoKeywordList = await fetchJsonData<string[]>(name, seoKeywordsPrompt, 'seoKeywordsList') || [];

    const bioKeywordsComment = preBioSeoKeywordList.length
      ? `<!-- SEO keywords: ${preBioSeoKeywordList.join(', ')} -->\n\n`
      : '';

    const detailedBiographyMarkdownPromptFinal = `${bioKeywordsComment}${detailedBiographyMarkdownPrompt}`;
    const detailedBiographyMarkdown = await fetchGeneratedInfo(name, detailedBiographyMarkdownPromptFinal);

    expandedBiographyPortableText = detailedBiographyMarkdown
      ? await parseMarkdownToPT(detailedBiographyMarkdown)
      : tmdbBiography ? await parseMarkdownToPT(tmdbBiography) : [];

    const faqPrompt = `From ${name}'s biography, create 4-6 FAQs. Format: {"faqList":[{"question":"...","answer":"..."}]}`;
    const rawFaq = await fetchJsonData<Array<{ question: string; answer: string }>>(name, faqPrompt, 'faqList');
    seoContentBlocks = rawFaq?.map(f => ({ _key: nanoid(), keyword: f.question, answer: f.answer })) || [];
  }

  let validDeathDateForSanity: Date | undefined = undefined;
  if (isDead && deathDate && /^\d{4}-\d{2}-\d{2}$/.test(deathDate)) {
    const parsed = new Date(deathDate);
    if (!isNaN(parsed.getTime())) validDeathDateForSanity = parsed;
  }

  const processedData: CelebrityData = {
    name,
    dob,
    country,
    intro: importBio && shortIntro ? [
      {
        _key: 'introKey',
        _type: 'block',
        children: [{ _key: 'spanKey', _type: 'span', marks: [], text: shortIntro }],
        markDefs: [],
        style: 'normal',
      },
    ] : [],
    image: await uploadImageToSanity(`https://image.tmdb.org/t/p/original${celebrityData.profile_path}`),
    metaDescription: `Explore ${name}'s biography, height, age, ethnicity, and achievements.`,
    profession,
    slug: { _type: 'slug', current: name.toLowerCase().replace(/\s+/g, '-') },
    powerMeter: Math.floor(Math.random() * 41) + 70,
    gender: genderString,
    isDead,
    deathDate: validDeathDateForSanity,
    expandedBiography: expandedBiographyPortableText,
    seoKeywords: preBioSeoKeywordList,
    seoContentBlocks,
   ethnicity: (await fetchGeneratedInfo(
  name,
      `Answer only with the ethnicity of ${name}, using 1–3 words. Do not explain, justify, or apologize. If unknown, respond with "Unknown".`
    ))?.split(',').map((s: string) => s.trim()),

    eyeColor: await fetchGeneratedInfo(
      name,
      `What is the eye color of ${name}? Respond with only the eye color (e.g., "Brown"). If unknown, respond with "Unknown". Do not apologize or explain.`
    ),

    hairColor: await fetchGeneratedInfo(
      name,
      `What is the hair color of ${name}? Respond with only the hair color (e.g., "Black"). If unknown, respond with "Unknown". Do not add context.`
    ),

    height: await fetchGeneratedInfo(
      name,
      `What is the height of ${name}? Respond in format like: 5' 10" (178 cm). No extra text. If unknown, respond with "Unknown".`
    ),

    bodyType: await fetchGeneratedInfo(
      name,
      `Describe ${name}'s body type in 1 or 2 words (e.g., "Athletic", "Slim"). If unknown, respond with "Unknown". Do not explain or elaborate.`
    ),

    tmdbId: Number(personTmdbId),
  };

  const createdCeleb = await client.create({
    _type: 'facesCelebs',
    ...processedData,
  });

  // ✅ Attach film to this new celeb’s credits[] if filmId is provided
if (options.filmId) {
  await client
    .patch(createdCeleb._id)
    .setIfMissing({ credits: [] })
    .append('credits', [
      {
        _key: nanoid(),
        _type: 'object',
        film: { _type: 'reference', _ref: options.filmId },
        role: celebrityData.known_for_department || 'Cast',
      }
    ])
    .commit();
}


  if (!importBio || importMoviesOnly) {
  await assignCelebrityCreditsToFilms({ tmdbId: personTmdbId, sanityId: createdCeleb._id });
}

  return createdCeleb;
};