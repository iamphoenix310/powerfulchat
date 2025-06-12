import Replicate from 'replicate';

if (!process.env.REPLICATE_API_TOKEN) {
  throw new Error('Missing REPLICATE_API_TOKEN in environment');
}

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
