// pages/api/gradio.ts
import { client } from '@gradio/client';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const app = await client(`${process.env.NEXT_PUBLIC_GRADLE_LINK}`, {});
        const result = await app.predict(0, []);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Error fetching data' });
    }
}
