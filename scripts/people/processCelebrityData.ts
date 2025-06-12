import { fetchCelebrityData } from './tmdb';
import { uploadImageToSanity } from './imageUpload';
import { client } from '@/app/utils/sanityClient';
import { markdownToPortableText as parseMarkdownToPT } from '@/utils/markdownToPortableText';
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
}

const checkIfCelebrityExists = async (name: string) => {
  const query = `*[_type == "facesCelebs" && name == $name][0] { _id, name }`;
  return await client.fetch(query, { name });
};

const fetchGeneratedInfo = async (name: string, infoType: string) => {
  try {
    const response = await fetch('/api/admin/generateCelebInfo', {
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
  try {
    const response = await fetch('/api/admin/isPersonDead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ personName: name, dob }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[fetchDeathInfo] HTTP error for ${name} (DOB: ${dob}): ${response.status} - ${errorText}`);
      return { isDead: false, deathDate: '' };
    }
    const data = await response.json();
    return { isDead: data.isDead || false, deathDate: data.deathDate || '' };
  } catch (error) {
    console.error(`[fetchDeathInfo] Error fetching death info for ${name} (DOB: ${dob}):`, error);
    return { isDead: false, deathDate: '' };
  }
};

export const processCelebrityData = async (
  tmdbId: string,
  options: { importBio?: boolean; importMoviesOnly?: boolean, filmId?: string } = {}
) => {
  const { importBio = true, importMoviesOnly = false } = options;
  const celebrityData = await fetchCelebrityData(tmdbId);
  if (!celebrityData || !celebrityData.id) {
    console.warn(`⚠️ No celebrity data found for TMDB ID: ${tmdbId}`);
    return null;
  }

  const personTmdbId = String(celebrityData.id);


  if (!celebrityData || !celebrityData.profile_path || !celebrityData.name) {
  console.warn(`⚠️ Skipping low-quality or missing celeb data for TMDB ID: ${tmdbId}`);
  return null;
}


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
  if (importBio && !importMoviesOnly) {
    const existingData = await client.fetch(
      `*[_type == "facesCelebs" && _id == $id][0]{ _id, expandedBiography }`,
      { id: existing._id }
    )

    if (!existingData?.expandedBiography || existingData.expandedBiography.length === 0) {
      const detailedMarkdown = await fetchGeneratedInfo(name, detailedBiographyMarkdownPrompt)
      const expandedPT = detailedMarkdown ? await parseMarkdownToPT(detailedMarkdown) : []
      await client.patch(existing._id).set({ expandedBiography: expandedPT }).commit()
    }
  }

  // ✅ Always attach the film credit if filmId is passed
  if (options.filmId) {
    await client.patch(existing._id).setIfMissing({ credits: [] }).append('credits', [
      {
        _key: nanoid(),
        film: { _type: 'reference', _ref: options.filmId },
        role: celebrityData.known_for_department || 'Unknown'
      }
    ]).commit()
  }

  return existing
}


  const country = celebrityData.place_of_birth
    ? celebrityData.place_of_birth.split(',').pop()?.trim() || ''
    : await fetchGeneratedInfo(name, 'just tell the country name of this person');

  let dob = celebrityData.birthday || '';
  if (!dob) {
    dob = await fetchGeneratedInfo(name, 'generate only date of birth in YYYY-MM-DD format. If date of birth not found, return an empty string.');
  }

  const genderMap: Record<number, string> = { 1: 'Female', 2: 'Male', 3: 'Non-binary', 0: 'Not Specified' };
  const genderString = genderMap[celebrityData.gender] || 'Not Specified';

  const professionsRaw = await fetchGeneratedInfo(name, `Provide a list of ${name}'s primary professions in a single line, comma-separated. Keep multi-word professions intact.`);
  const profession = professionsRaw
    ? professionsRaw.split(',').map((p: string) => p.trim()).filter(Boolean).map((p: string) => genderString === 'Female' && p.toLowerCase() === 'actor' ? 'Actress' : p)
    : [];

  const { isDead, deathDate } = await fetchDeathInfo(name, dob);

  const shortIntro = await fetchGeneratedInfo(name, `Create a short and SEO-optimized intro (3 lines) for ${name}. Mention their work, highlights, and country.`);

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
    seoContentBlocks = rawFaq?.map(f => ({ keyword: f.question, answer: f.answer })) || [];
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
    intro: importBio ? [
      {
        _key: 'introKey',
        _type: 'block',
        children: [{ _key: 'spanKey', _type: 'span', marks: [], text: shortIntro || tmdbBiography }],
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
    ethnicity: (await fetchGeneratedInfo(name, 'just tell ethnicity in one, two or three words'))?.split(','),
    eyeColor: await fetchGeneratedInfo(name, 'just tell eye color type nothing else'),
    hairColor: await fetchGeneratedInfo(name, 'just tell hair color type nothing else'),
    height: await fetchGeneratedInfo(name, `just tell height in format: 5' 10" (170 cm) type nothing else`),
    bodyType: await fetchGeneratedInfo(name, 'just tell body type in one or two words'),
  };

  const createdCeleb = await client.create({
    _type: 'facesCelebs',
    ...processedData,
    tmdbId: Number(personTmdbId)
  });

  if (options.filmId) {
  await client.patch(createdCeleb._id).setIfMissing({ credits: [] }).append('credits', [
    {
      _key: nanoid(),
      film: { _type: 'reference', _ref: options.filmId },
      role: celebrityData.known_for_department || 'Unknown'
    }
  ]).commit()
}


  return createdCeleb;
};
