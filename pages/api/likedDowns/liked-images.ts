import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/app/utils/sanityClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userEmail, imageId } = req.body;
    
    try {
      // Fetch the user document based on the email
      const userQuery = `*[_type == "user" && email == $userEmail]{_id, likedImages}[0]`;
      const user = await client.fetch(userQuery, { userEmail });

      if (!user) {
        throw new Error('User not found');
      }

      const userId = user._id;
      const hasLiked = user.likedImages && user.likedImages.some((img: { _ref: any; }) => img._ref === imageId);

      if (hasLiked) {
        // Filter out the unliked image
        const updatedLikedImages = user.likedImages.filter((img: { _ref: any; }) => img._ref !== imageId);
        // Update the user document with the filtered array
        await client.patch(userId)
                   .set({ likedImages: updatedLikedImages })
                   .commit();
      } else {
        // Add the liked image
        await client.patch(userId)
                   .setIfMissing({ likedImages: [] })
                   .insert('after', 'likedImages[-1]', [{ _key: `like-${userId}-${imageId}`, _ref: imageId }])
                   .commit();
      }

      res.status(200).json({ message: hasLiked ? 'Image unliked' : 'Image liked' });
    } catch (err) {
      console.error('Error in handler:', err);
      res.status(500).json({ message: 'Error updating like status' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
