import { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name, website, imageUrl } = req.query;

  if (!name || !website || !imageUrl) {
    return res.status(400).json({ error: 'Missing required query parameters.' });
  }

  const width = 1200;
  const height = 630;

  try {
    // Fetch the profile image
    const response = await fetch(imageUrl as string);
    if (!response.ok) {
      throw new Error('Failed to fetch the profile image.');
    }

    // Convert the response to a buffer
    const arrayBuffer = await response.arrayBuffer();
    const profileImageBuffer = Buffer.from(arrayBuffer);

    // Create text overlay with SVG
    const textOverlay = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .title { font-size: 60px; fill: white; font-family: Arial, sans-serif; text-anchor: middle; }
          .subtitle { font-size: 40px; fill: white; font-family: Arial, sans-serif; text-anchor: middle; }
        </style>
        <rect width="100%" height="100%" fill="#4a4a32" />
        <text x="900" y="300" class="title">${name}</text>
        <text x="900" y="400" class="subtitle">${website}</text>
      </svg>
    `);

    // Generate the composite image
    const imageBuffer = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: '#4a4a32', // Background color
      },
    })
      .composite([
        {
          input: profileImageBuffer,
          top: 30, // Set vertical position
          left: 50, // Padding from the left
        },
        {
          input: textOverlay,
          top: 0,
          left: 0,
        },
      ])
      .jpeg()
      .toBuffer();

    // Set the response headers
    res.setHeader('Content-Type', 'image/jpeg');
    res.status(200).send(imageBuffer);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
