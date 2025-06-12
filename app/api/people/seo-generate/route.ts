import { NextResponse } from "next/server";
import { client } from "@/app/utils/sanityClient";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { slug, keywords } = await req.json(); // accept array of keywords

  if (!slug || !keywords || !Array.isArray(keywords)) {
    return NextResponse.json({ error: "Missing slug or keywords" }, { status: 400 });
  }

  const person = await client.fetch(
    `*[_type == "facesCelebs" && slug.current == $slug][0]`,
    { slug }
  );

  if (!person) {
    return NextResponse.json({ error: "Celebrity not found" }, { status: 404 });
  }

  // Create a single GPT prompt that instructs GPT to answer each keyword uniquely
  const prompt = `
You're a biography and SEO writer. You are writing a set of SEO-optimized content sections for a public celebrity profile page.

The celebrity name is **${person.name}**.

Each of the following topics or questions relates to this person, even if their name is not mentioned explicitly.

Instructions:
- Assume the reader already knows this is a page about ${person.name}.
- DO NOT start every paragraph with their name.
- Keep content natural, varied, and non-repetitive.
- Avoid repeating the same facts in multiple answers.
- Each answer should be focused and useful for search engines.

Respond in this format ONLY:
Q: [Original Keyword]
A: [Answer paragraph]

Topics:
${keywords.map((k, i) => `${i + 1}. ${k}`).join("\n")}
`;


  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Use a better one than 'mini' for detailed answers
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = chat.choices[0].message.content?.trim();

  if (!raw) {
    return NextResponse.json({ error: "No response from OpenAI" }, { status: 500 });
  }

  // Parse OpenAI output into structured blocks
  const blocks: { keyword: string; answer: string }[] = [];

  const regex = /Q:\s*(.+?)\nA:\s*([\s\S]+?)(?=\nQ:|$)/g;
  let match;
  while ((match = regex.exec(raw)) !== null) {
    const keyword = match[1].trim();
    const answer = match[2].trim();
    if (keyword && answer) {
      blocks.push({ keyword, answer });
    }
  }

  if (blocks.length === 0) {
    return NextResponse.json({ error: "Could not parse GPT output" }, { status: 500 });
  }

  // Append to Sanity
  await client.patch(person._id)
    .setIfMissing({ seoContentBlocks: [] })
    .append("seoContentBlocks", blocks)
    .commit();

  return NextResponse.json({ success: true, blocks });
}
