// pages/api/checkDeathInfo.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { generateDeathInfo } from './generateDeathInfo';
import { client } from '@/app/utils/sanityClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { personId, personName } = req.body;

  if (!personId || !personName) {
    return res.status(400).json({ error: 'Person ID and name are required.' });
  }

  try {
    const { isDead, deathDate } = await generateDeathInfo(personName);

    if (isDead && deathDate) {
      // Update Sanity with the death date and isDead flag
      await client.patch(personId)
        .set({
          isDead: true,
          deathDate: deathDate,
        })
        .commit();

      return res.status(200).json({ success: true, isDead, deathDate });
    } else {
      return res.status(200).json({ success: true, isDead: false });
    }
  } catch (error) {
    console.error('Error in API route:', error);
    return res.status(500).json({ error: 'Failed to check or update death information.' });
  }
}
