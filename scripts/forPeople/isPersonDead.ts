import { NextApiRequest, NextApiResponse } from 'next';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { personName, dob } = req.body;

  try {
    const prompt = `Please determine the status of ${personName}, born on ${dob}. Respond with: "Status: Alive" or "Status: Deceased", followed by "Date of Death: YYYY-MM-DD" if applicable.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an expert historian with a focus on biographical information.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 50,
    });

    const completion = response.choices[0].message?.content?.trim() || '';

    // Improved parsing logic
    const isDead = completion.toLowerCase().includes("status: deceased");
    const deathDateMatch = completion.match(/date of death:\s*(\d{4}-\d{2}-\d{2})/i);
    const deathDate = deathDateMatch ? deathDateMatch[1] : null;

    res.status(200).json({ isDead, deathDate });
  } catch (error) {
    console.error('Error checking if person is dead:', error);
    res.status(500).json({ error: 'Failed to check if person is dead.' });
  }
}
