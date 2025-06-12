import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name } = req.body;
    const tmdbApiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    if (!tmdbApiKey) {
      console.error("❌ Missing API Key");
      return res.status(500).json({ error: "Missing API Key" });
    }

    console.log(`🔎 Fetching trends for: ${name}`);

    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/person?api_key=${tmdbApiKey}&query=${encodeURIComponent(name)}`
    );

    if (!tmdbResponse.ok) {
      console.error("❌ TMDb API Error:", await tmdbResponse.text());
      return res.status(500).json({ error: "Failed to fetch TMDb data" });
    }

    const tmdbData = await tmdbResponse.json();
    console.log("✅ TMDb Response:", tmdbData);

    const trendingScore = tmdbData.results?.[0]?.popularity || 0;

    return res.status(200).json({ trendingScore });
  } catch (error) {
    console.error("❌ API Error:", error);
    return res.status(500).json({ error: "Failed to fetch trends" });
  }
}