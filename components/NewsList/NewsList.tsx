// src/components/NewsList/NewsList.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import Adu from "@/components/GooAds/Adu";

interface ArticlePreview {
  _id: string;
  title: string;
  subtitle?: string;
  mainImage?: string;
  publishedAt?: string;
  readingTime?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  slug: { current: string };
  views?: number;
}

interface NewsListProps {
  articles: ArticlePreview[];
}

const NewsList: React.FC<NewsListProps> = ({ articles }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">Latest News</h1>

      {articles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-600">No articles available at the moment.</p>
          <p className="text-gray-500">Please check back later!</p>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          {articles[0] && (
            <div className="mb-12">
              <Link
                href={`/news/${articles[0].slug.current}`}
                onClick={() => console.log(`Navigating to: /news/${articles[0].slug.current}`)}
              >
                <div className="grid md:grid-cols-2 gap-6">
                  {articles[0].mainImage ? (
                    <div className="relative h-96">
                      <Image
                        src={articles[0].mainImage}
                        alt={articles[0].title}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                      />
                    </div>
                  ) : (
                    <div className="relative h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                      <span className="text-gray-500">No image available</span>
                    </div>
                  )}
                  <div>
                    {articles[0].isBreaking && (
                      <span className="bg-red-500 text-white px-2 py-1 text-sm rounded mb-2 inline-block">
                        Breaking News
                      </span>
                    )}
                    <h2 className="text-2xl font-bold mb-2">{articles[0].title || "Untitled"}</h2>
                    <p className="text-gray-600 mb-4">{articles[0].subtitle || "No subtitle"}</p>
                    <div className="text-sm text-gray-500">
                      <span>
                        {articles[0].publishedAt
                          ? new Date(articles[0].publishedAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {articles[0].readingTime
                          ? `${articles[0].readingTime} min read`
                          : "Reading time unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Ad Placement */}
          <div className="my-8 text-center">
            <span className="text-xs block mb-2">Advertisement</span>
            <Adu
              adSlot="9995634858"
              adFormat="auto"
              style={{ display: "inline-block", width: "728px", height: "90px" }}
            />
          </div>

          {/* Article Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {articles.slice(1).map((article) => (
              <Link
                key={article._id}
                href={`/news/${article.slug.current}`}
                onClick={() => console.log(`Navigating to: /news/${article.slug.current}`)}
              >
                <div className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  {article.mainImage ? (
                    <div className="relative h-48">
                      <Image
                        src={article.mainImage}
                        alt={article.title}
                        fill
                        className="object-cover"
                        onError={(e) => (e.currentTarget.src = "/fallback-image.jpg")}
                      />
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No image</span>
                    </div>
                  )}
                  <div className="p-4">
                    {article.isBreaking && (
                      <span className="bg-red-500 text-white px-2 py-1 text-sm rounded mb-2 inline-block">
                        Breaking News
                      </span>
                    )}
                    <h3 className="font-semibold text-lg mb-2">{article.title || "Untitled"}</h3>
                    <p className="text-gray-600 text-sm mb-2">{article.subtitle || "No subtitle"}</p>
                    <div className="text-xs text-gray-500">
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString()
                          : "Date unavailable"}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {article.readingTime
                          ? `${article.readingTime} min read`
                          : "Reading time unavailable"}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default NewsList;