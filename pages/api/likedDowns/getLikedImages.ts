// pages/api/getLikedImages.js

import { NextApiRequest, NextApiResponse } from 'next';
import { client } from '@/app/utils/sanityClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { email } = req.query;

    try {
        // Adjusted query to dereference the likedImages
        const query = `*[_type == "user" && email == $email]{
            "likedImages": likedImages[]->{
                _id,
                title,
                "imageUrl": image.asset->url, // Adjust this based on your image schema
                slug
            }
        }[0]`;
        const user = await client.fetch(query, { email });

        if (user && user.likedImages) {
            res.status(200).json({ likedImages: user.likedImages });
        } else {
            res.status(404).json({ message: 'No liked images found' });
        }
    } catch (error) {
        console.error('Error fetching liked images:', error);
        res.status(500).json({ message: 'Error fetching liked images' });
    }
}
