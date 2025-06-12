// pages/api/unlikePic.js

import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/app/utils/sanityClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userEmail, imageId } = req.body;

    try {
      // Fetch the user document by email
      const userDoc = await client.fetch(`*[_type == "user" && email == $userEmail][0]`, {
        userEmail,
      });


      if (userDoc && Array.isArray(userDoc.likedImages)) {
        const imageReference = userDoc.likedImages.find((img: { _ref: any; }) => img._ref === imageId);

        if (imageReference) {
          // Unset the image reference from the likedImages array
          const updatedUserDoc = await client
            .patch(userDoc._id)
            .unset([`likedImages[_ref == "${imageId}"]`])
            .commit();

          console.log('Image unliked:', imageId);
          res.status(200).json({ message: 'Image unliked', data: updatedUserDoc });
        } else {
          console.log('Image not found in likedImages array:', imageId);
          res.status(404).json({ message: 'Image not found in likedImages array' });
        }
      } else {
        console.log('User not found or likedImages is not an array:', userEmail);
        res.status(404).json({ message: 'User not found or likedImages is not an array' });
      }
    } catch (err) {
      console.error('Error unliking image:', err);
      res.status(500).json({ message: 'Error unliking image' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end('Method Not Allowed');
  }
}
