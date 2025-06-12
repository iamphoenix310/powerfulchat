// pages/api/likedDowns/likePic.js

import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/app/utils/sanityClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userEmail, imageId } = req.body;

    try {
      // Fetch the user's document based on their email
      const userDoc = await client.fetch(`*[_type == "user" && email == $userEmail][0]`, { userEmail });

      if (!userDoc) {
        throw new Error('User not found');
      }

      const userId = userDoc._id;

      // Now you have the userId, you can proceed with liking the image
      const result = await client.patch(userId)
        .setIfMissing({ likedImages: [] })
        .insert('after', 'likedImages[-1]', [{
          _key: `like-${userId}-${imageId}`,
          _ref: imageId
        }])
        .commit();

      res.status(200).json({ message: 'Image liked', data: result });
    } catch (err) {
      console.error('Error liking image:', err);
      res.status(500).json({ message: 'Error liking image' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
