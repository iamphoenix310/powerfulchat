// lib/uploadImage.ts
import axios from 'axios';
import { client } from '@/app/utils/sanityClient';

export const uploadImageToSanity = async (imageUrl: string) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    const asset = await client.assets.upload('image', buffer, {
      filename: 'celebrity-image.jpg',
    });

    return {
      _type: 'image',
      asset: {
        _ref: asset._id,
        _type: 'reference',
      },
    };
  } catch (error) {
    console.error('Error uploading image to Sanity:', error);
    return null;
  }
};
