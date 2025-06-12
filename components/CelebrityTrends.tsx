"use client";

import { useEffect, useState } from "react";

interface CelebrityTrendsProps {
  celebrityName: string;
}

const CelebrityTrends: React.FC<CelebrityTrendsProps> = ({ celebrityName }) => {
  const [trendingScore, setTrendingScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingScore = async () => {
      try {
        const response = await fetch("/api/getCelebrityTrends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: celebrityName }),
        });

        if (!response.ok) throw new Error("Failed to fetch trends");

        const data = await response.json();
        setTrendingScore(data.trendingScore || 0);
      } catch (err) {
        setError("Error fetching trending data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingScore();
  }, [celebrityName]);

  return (
    <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xl rounded-lg max-w-md mx-auto">
      {/* Header */}
      <h3 className="text-2xl font-bold text-center">{celebrityName} Web Trending Score</h3>

      {/* Loading & Error States */}
      {loading ? (
        <p className="text-gray-300 text-center mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-400 text-center mt-4">{error}</p>
      ) : (
        <div className="mt-6 bg-white p-4 rounded-lg shadow-md text-center">
       {/*   <h2 className="text-lg font-semibold text-gray-900">Trending Score</h2> */}

          {/* Animated Progress Bar */}
          <div className="relative w-full bg-gray-300 rounded-full h-4 mt-3 overflow-hidden">
            <div
              className="h-4 bg-blue-500 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${Math.min((trendingScore || 0) * 10, 100)}%` }}
            ></div>
          </div>

          {/* Score Number */}
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {trendingScore ? trendingScore.toFixed(3) : "0.000"}
          </p>

          {/* Source */}
          <p className="text-sm text-gray-500 mt-1">Source: Web Popularity Index</p>
        </div>
      )}
    </div>
  );
};

export default CelebrityTrends;