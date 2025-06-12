import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export const generateDeathInfo = async (name: string): Promise<{ isDead: boolean; deathDate?: string }> => {
  const prompt = `Is the celebrity named ${name} dead? If yes, provide the date of death in the format YYYY-MM-DD. If not, just say "No".`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 50,
    });

    const answer = response.choices?.[0]?.message?.content?.trim().toLowerCase() ?? '';
    
    if (answer === 'no') {
      return { isDead: false };
    } else {
      return { isDead: true, deathDate: answer };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unexpected error:', error);
    }
    throw new Error('Failed to generate death information.');
  }
};
