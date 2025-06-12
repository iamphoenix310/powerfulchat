// pages/api/generate-celebs.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { processCelebrityData } from './processCelebData';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No IDs provided' });
  }

  // Send immediate response to frontend
  res.status(202).json({ message: `Started generation for ${ids.length} celebrities.` });

  // Delay configuration (default: 10s)
  const delayMs = parseInt(process.env.CELEB_GEN_DELAY || '10000', 10);

  // Sequential background processing
  (async () => {
    for (const id of ids) {
      try {
        console.log(`▶️ Processing TMDB ID: ${id}`);
        const result = await processCelebrityData(id);
        if (result) {
          console.log(`✅ Successfully generated TMDB ID: ${id}`);
        } else {
          console.warn(`⚠️ Skipped or failed TMDB ID: ${id}`);
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error(`❌ Error processing TMDB ID ${id}:`, err.message);
        } else {
          console.error(`❌ Unknown error for TMDB ID ${id}:`, err);
        }
      }

      console.log(`⏳ Waiting ${(delayMs / 1000).toFixed(1)}s before next ID...`);
      await delay(delayMs);
    }

    console.log('🎉 All IDs processed.');
  })();
}
