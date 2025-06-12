import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { question, celebrity, conversation } = req.body;

  if (!question || !celebrity) {
    return res.status(400).json({ error: "Missing required parameters." });
  }

  const messages = [
    { role: "system", content: `You are an expert on ${celebrity}.` },
    ...(conversation || []).map(({ question }: { question: string }) => ({
      role: "user",
      content: question,
    })),
    { role: "user", content: question },
  ];

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // ✅ Uses API key from .env.local
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", errorData);
      return res.status(response.status).json({ error: "OpenAI API Error" });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No answer received.";

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Error fetching answer:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}