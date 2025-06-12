import { OpenAI } from 'openai';
import { nanoid } from 'nanoid';
import slugify from 'slugify';
import { client } from '@/app/utils/sanityClient';
import { markdownToPortableText, PortableTextBlock } from '@/utils/markdownToPortableText';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AUTHOR_ID = '115104875443499950252'; // existing user
const CATEGORY_ID = 'a7e79ab2-d6ad-47eb-ac12-9ceec363d160'; // celebrity news

export async function createArticleFromRssItem(item: any): Promise<{ slug: string; title: string } | null> {
  const title = item.title || 'Untitled';
  const sourceUrl = item.link;
  const pubDate = item.pubDate;
  const contentSnippet = item.description || item.content || item['content:encoded'];
  const rawImage = item.image;

  const existing = await client.fetch(`*[_type == "articles" && sourceUrl == $sourceUrl][0]`, { sourceUrl });
  if (existing) return null;

  const prompt = `
You're an expert journalist and SEO writer.

Write a detailed, engaging, SEO-friendly news article based on this story:

"${contentSnippet}"

Output must follow this structure (but DO NOT include labels like "Title:", "Body:" etc.):

- Short, creative SEO-friendly title (1 line)
- Meta description (max 160 characters)
- Intro: 2 paragraphs
- Body: 4–6 paragraphs, include contextual H2/H3 subheadings
- Positive takeaway (if applicable)
- Call to action encouraging sharing/reflection

Use markdown for headings (## for H2, ### for H3). Write clearly, as if for a 14-year-old. Don't sound robotic, 
Plus give perspective on how the situation can be handled in positive manner. 
  `;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const markdown = completion.choices[0]?.message?.content?.trim() || '';
  const blocks = await markdownToPortableText(markdown);

  const rawTitle = blocks[0]?.children?.[0]?.text?.trim() || title;
  const slug = slugify(rawTitle.split(/\s+/).slice(0, 8).join(' '), { lower: true, strict: true });

  const sourceCreditBlock: PortableTextBlock = {
    _type: 'block',
    _key: nanoid(),
    style: 'normal',
    children: [
      {
        _type: 'span',
        _key: nanoid(),
        text: 'Originally reported by Page Six. ',
        marks: [],
      },
      {
        _type: 'span',
        _key: nanoid(),
        text: 'Read Original.',
        marks: ['linkMark'],
      },
    ],
    markDefs: [
      {
        _type: 'link',
        _key: 'linkMark',
        href: sourceUrl,
      },
    ],
  };

  const intro = blocks.slice(2, 4);
  const body = blocks.slice(4).concat([sourceCreditBlock]);

  const textForMeta = intro
    .map(b => b.children?.map(c => c.text).join(' ') || '')
    .join(' ')
    .slice(0, 160);

const publisherName = item['dc:creator'] || item.source || 'Unknown Source'

 const mainImage = rawImage
  ? {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: await uploadImageToSanity(rawImage),
      },
      alt: `Image via ${publisherName}`,
      caption: `Image via ${publisherName}`,
    }
  : null;


  const articleDoc = {
    _type: 'articles',
    title: rawTitle,
    slug: { current: slug },
    metaDescription: textForMeta,
    intro,
    body,
    outro: [],
    sourceUrl,
    publisherName: 'Page Six',
    publishedAt: new Date(pubDate || new Date()).toISOString(),
    author: [{ _type: 'reference', _ref: AUTHOR_ID, _key: `author-${AUTHOR_ID}` }],
    categories: [{ _type: 'reference', _ref: CATEGORY_ID, _key: `cat-${CATEGORY_ID}` }],
    mainImage,
    coinsToEarn: 5,
    views: 0,
    easterEgg: 0,
    readingTime: Math.ceil(markdown.split(/\s+/).length / 200),
  };

  await client.create(articleDoc);
  return { slug, title: rawTitle };
}

async function uploadImageToSanity(imageUrl: string): Promise<string> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`);
    const buffer = await res.arrayBuffer();
    const file = new File([buffer], 'rss-image.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', 'rss-image.jpg');

    const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sanity/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} — ${errorText}`);
    }

    const data = await uploadRes.json();
    if (!data._id) throw new Error(`Upload response missing _id`);

    return data._id;
  } catch (err: any) {
    console.error('Image Upload Error:', err.message || err);
    throw err;
  }
}
