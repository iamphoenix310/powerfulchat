import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCelebrityInfo } from '@/pages/api/openAi';

const generateCelebrityInfoHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { name, infoType } = req.body;

    if (!name || !infoType) {
      return res.status(400).json({ error: 'Name and infoType are required' });
    }

    try {
      const info = await generateCelebrityInfo(name, infoType);
      return res.status(200).json({ text: info });
    } catch (error) {
      console.error('Error generating celebrity info:', error);
      return res.status(500).json({ error: 'Failed to generate information' });
    }
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
};

export default generateCelebrityInfoHandler;
