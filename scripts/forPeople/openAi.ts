import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const generateCelebrityInfo = async (name: string, infoType: string): Promise<string> => {
  const isCustomPrompt = infoType.includes('{') || infoType.includes(':') || infoType.includes('##') || infoType.length > 100;
  const prompt = isCustomPrompt
    ? infoType
    : `Generate the ${infoType} for a celebrity named ${name}.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 3000,
      temperature: 0.8,
    });

    return response.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw new Error('Failed to generate information.');
  }
};
