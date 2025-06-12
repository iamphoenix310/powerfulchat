
import { fetchCelebrityData } from './tmdb';
import { uploadImageToSanity } from './imageUpload';
import { client } from '@/app/utils/sanityClient';


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
}

// Function to check if a celebrity already exists in Sanity
const checkIfCelebrityExists = async (name: string) => {
  const query = `*[_type == "facesCelebs" && name == $name][0] { _id, name }`;
  const params = { name };
  const result = await client.fetch(query, params);
  return result;
};

// Fetches the generated info from the API route
const fetchGeneratedInfo = async (name: string, infoType: string) => {
  try {
    const response = await fetch('/api/generateCelebInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, infoType }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error fetching generated info:', error);
    return '';
  }
};


export const processCelebrityData = async (tmdbId: string) => {
  const celebrityData = await fetchCelebrityData(tmdbId);

  if (!celebrityData) return null;

  // Skip if no profile image in TMDB
  if (!celebrityData.profile_path) {
    console.log(`Skipping ${celebrityData.name} due to missing profile image.`);
    return null;
  }

  // Check if the person already exists in Sanity
  const existingCelebrity = await checkIfCelebrityExists(celebrityData.name);
  if (existingCelebrity) {
    console.log(`${celebrityData.name} already exists in Sanity. Skipping.`);
    return null;
  }

  // Fill missing fields using the server-side API route
  if (!celebrityData.biography) {
    celebrityData.biography = await fetchGeneratedInfo(celebrityData.name, 'biography');
  }

  // Handle the place_of_birth and country extraction
  let country = '';
  if (celebrityData.place_of_birth) {
    country = celebrityData.place_of_birth.split(',').pop()?.trim() || '';
  } else {
    country = await fetchGeneratedInfo(celebrityData.name, 'just tell the country name of this person');
  }

  const shortIntro = await fetchGeneratedInfo(
    celebrityData.name,
    `Create a short and unique and attractive and seo optimised biography introduction in three lines, for ${celebrityData.name}, a well-known their work.} from ${celebrityData.place_of_birth}. Mention key highlights and achievements in a few sentences.`
  );

  // Use OpenAI API to fill the date of birth if missing
  let dob = celebrityData.birthday || '';
  if (!dob) {
    dob = await fetchGeneratedInfo(celebrityData.name, 'generate only date of birth in YYYY-MM-DD format');
  }

  const processedData: CelebrityData = {
    name: celebrityData.name,
    dob,
    country,
    intro: [
      {
        _key: 'introKey', // Generate unique key
        _type: 'block',
        children: [
          {
            _key: 'spanKey', // Generate unique key
            _type: 'span',
            marks: [],
            text: shortIntro || celebrityData.biography || '',
          },
        ],
        markDefs: [],
        style: 'normal',
      },
    ],
    image: await uploadImageToSanity(`https://image.tmdb.org/t/p/original${celebrityData.profile_path}`),
    metaDescription: `Explore ${celebrityData.name}'s biography, height, age, ethnicity, and ask any question about ${celebrityData.name}.`,
    // profession,
    slug: {
      _type: 'slug',
      current: celebrityData.name.toLowerCase().replace(/\s+/g, '-'),
    },
    powerMeter: Math.floor(Math.random() * 41) + 70, // Generates a random number between 70 and 110
    gender: celebrityData.gender === 1 ? 'Female' : 'Male',
    profession: []
  };

  // Use the server-side API route to fill optional attributes
  // Fetch and process professions
const professionString = await fetchGeneratedInfo(
  celebrityData.name,
  'tell their primary professions without adding any numbers and counting. Also dont make sentences, just add professions with camel case for each word, having camel case is very important.'
);

// Split the string by space or capitalize the words to ensure each word is treated as a separate entry
processedData.profession = professionString
  ?.match(/([A-Z][a-z]+|[A-Z]+)/g) // Matches each word starting with a capital letter
  ?.map((p: string) => p.trim()) // Remove any leading/trailing spaces
  .filter((p: string) => p.length > 0); // Filter out any empty strings

// `processedData.profession` is now an array of professions

  processedData.ethnicity = (await fetchGeneratedInfo(celebrityData.name, 'just tell ethnicity in one, two or three words'))?.split(',');
  processedData.eyeColor = await fetchGeneratedInfo(celebrityData.name, 'just tell eye color type nothing else, not even full stop after the word');
  processedData.hairColor = await fetchGeneratedInfo(celebrityData.name, 'just tell hair color type nothing else, not even full stop at the end');
  processedData.height = await fetchGeneratedInfo(celebrityData.name, `just tell height in following format: 5' 10" (170 cm) type nothing else, not even full stop`);
  processedData.bodyType = await fetchGeneratedInfo(celebrityData.name, 'just tell body type in one or two words, type nothing else, , not even full stop');

  // Add to Sanity
  return await client.create({
    _type: 'facesCelebs',
    ...processedData,
  });
};