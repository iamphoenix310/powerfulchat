import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { client } from '@/app/utils/sanityClient';
import slugify from 'slugify';
import { markdownToPortableText } from '@/utils/markdownToPortableText';
import { nanoid } from 'nanoid';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export async function POST(req: Request) {
  const body = await req.json();
  const { category, author, sourceInfo, tags } = body;

  if (!category?.length || !author?.length || !sourceInfo) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
  }

  try {
    const prompt = `
You're an expert journalist and SEO writer.

Write a detailed, engaging neutral and existing, SEO-friendly news article based on this story:

"${sourceInfo}"

Output must follow this structure (but DO NOT include labels like "Title:", "Body:" etc.):

- Short, creative SEO-friendly title (1 line)
- Meta description (max 160 characters)
- Intro: 2 paragraphs
- Body: 4–6 paragraphs, include contextual H2/H3 subheadings
- Positive takeaway (if applicable)
- Call to action encouraging sharing/reflection

Use markdown for headings (## for H2, ### for H3). Write clearly, as if for a 14-year-old. Don't sound robotic.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75
    });

    const markdown = completion.choices[0]?.message?.content?.trim() || '';
    const blocks = await markdownToPortableText(markdown);

    const rawTitle = blocks[0]?.children?.[0]?.text?.trim() || '';
    const fallbackTitle = sourceInfo.trim().split(/\s+/).slice(0, 8).join(' ');
    const finalTitle = rawTitle.length > 0 ? rawTitle : fallbackTitle;

    const startBodyIndex = blocks.findIndex(b => b.style === 'h2' || b.style === 'h3');
    const startOutroIndex = blocks.findLastIndex(b =>
      b.children?.[0]?.text?.toLowerCase()?.includes('what we learn') ||
      b.children?.[0]?.text?.toLowerCase()?.includes('share')
    );

    const intro = blocks.slice(2, startBodyIndex > 1 ? startBodyIndex : 4);
    const body = (startBodyIndex >= 0 && startOutroIndex > startBodyIndex)
      ? blocks.slice(startBodyIndex, startOutroIndex)
      : blocks.slice(startBodyIndex >= 0 ? startBodyIndex : 4);
    const outro = (startOutroIndex >= 0)
      ? blocks.slice(startOutroIndex)
      : blocks.slice(-2);

    const fullTextForMeta = [...intro, ...body]
      .map(b => b.children?.[0]?.text || '')
      .join(' ')
      .slice(0, 2000);

    const metaGenPrompt = `
Based on this article content, write a short SEO meta description (max 160 characters) in neutral tone:

"${fullTextForMeta}"
`;

    const metaCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: metaGenPrompt }],
      temperature: 0.5,
    });

    const metaDesc = metaCompletion.choices[0]?.message?.content?.trim().replace(/^"|"$/g, '') || 'An insightful look at today’s news.';

    const slug = slugify(finalTitle.split(/\s+/).slice(0, 8).join(' '), {
      lower: true,
      strict: true,
    });

    const allText = [...intro, ...body, ...outro].map(b => b.children?.[0]?.text || '').join(' ');
    const readingTime = estimateReadingTime(allText);

    const doc = {
      _type: 'articles',
      title: finalTitle,
      slug: { current: slug },
      subtitle: '',
      sourceUrl: '',
      publisherName: 'Powerful Creations',
      tags: tags || [],
      metaDescription: metaDesc,
      intro,
      body,
      outro,
      mainImage: null,
      coinsToEarn: 5,
      easterEgg: 0,
      readingTime,
      views: 0,
      publishedAt: new Date().toISOString(),
      author,
      categories: category,
      companies: [],
      people: [],
      isBreaking: false,
      isFeatured: false,
      isSponsored: false
    };

    await client.create(doc);
    return NextResponse.json({ slug, message: `✅ Article published.` });
  } catch (err: any) {
    console.error('OpenAI/Sanity error:', err.message || err);
    return NextResponse.json({ error: 'Failed to generate article.' }, { status: 500 });
  }
}
