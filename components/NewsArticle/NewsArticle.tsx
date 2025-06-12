// components/NewsArticle/NewsArticle.tsx
"use client";

import { useEffect, useState } from "react";
import { client } from "@/app/utils/sanityClient";
import { PortableText } from "@portabletext/react";
import Image from "next/image";
import Link from "next/link";
import Adu from "@/components/GooAds/Adu";

interface Author {
  _id: string;
  name: string;
  slug: { current: string };
}

interface Category {
  _id: string;
  title: string;
}

interface Article {
  _id: string;
  title: string;
  subtitle?: string;
  intro?: any[];
  body?: any[];
  outro?: any[];
  mainImage?: string;
  publishedAt?: string;
  readingTime?: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isSponsored?: boolean;
  author?: Author[];
  categories?: Category[];
  views?: number;
  slug: { current: string };
}

interface NewsArticleProps {
  initialArticle: Article;
}

const NewsArticle: React.FC<NewsArticleProps> = ({ initialArticle }) => {
  const [article, setArticle] = useState<Article | null>(initialArticle);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const updateViews = async () => {
      if (!article?._id) return;

      try {
        setLoading(true);
        const updated = await client
          .patch(article._id)
          .inc({ views: 1 })
          .commit();
        setArticle((prev) => (prev ? { ...prev, views: (prev.views || 0) + 1 } : null));
      } catch (err) {
        console.error("Error updating views:", err);
        setError("Failed to update article views");
      } finally {
        setLoading(false);
      }
    };

    updateViews();
  }, [article?._id]);

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article Not Available</h1>
        <p className="text-gray-600">Sorry, this article could not be loaded.</p>
        <Link href="/news" className="text-blue-500 hover:underline mt-4 inline-block">
          Back to News
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/news" className="text-blue-500 hover:underline mb-4 inline-block">
        ← Back to News
      </Link>

      {article.isBreaking && (
        <span className="bg-red-500 text-white px-2 py-1 text-sm rounded mb-4 inline-block">
          Breaking News
        </span>
      )}

      <h1 className="text-3xl md:text-4xl font-bold mb-2">{article.title || "Untitled Article"}</h1>
      <h2 className="text-xl md:text-2xl text-gray-600 mb-4">
        {article.subtitle || "No subtitle available"}
      </h2>

      <div className="flex items-center gap-4 mb-6 text-gray-500 text-sm">
        <span>
          {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Date unavailable"}
        </span>
        <span>•</span>
        <span>{article.readingTime ? `${article.readingTime} min read` : "Reading time unavailable"}</span>
        <span>•</span>
        <span>{loading ? "Updating views..." : `${article.views || 0} views`}</span>
      </div>

      {article.mainImage ? (
        <div className="relative w-full h-96 mb-6">
          <Image
            src={article.mainImage}
            alt={article.title || "Article image"}
            fill
            className="object-cover rounded-lg"
            onError={() => setArticle((prev) => (prev ? { ...prev, mainImage: undefined } : null))}
          />
        </div>
      ) : (
        <div className="w-full h-96 mb-6 bg-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-500">No image available</span>
        </div>
      )}

      <div className="prose max-w-none mb-8">
        {article.intro?.length ? (
          <PortableText value={article.intro} />
        ) : (
          <p className="text-gray-600">No introduction available.</p>
        )}
      </div>

      <div className="my-8 text-center">
        <span className="text-xs block mb-2">Advertisement</span>
        <Adu
          adSlot="9995634858"
          adFormat="auto"
          style={{ display: "inline-block", width: "300px", height: "250px" }}
        />
      </div>

      <div className="prose max-w-none mb-8">
        {article.body?.length ? (
          <PortableText value={article.body} />
        ) : (
          <p className="text-gray-600">No content available.</p>
        )}
      </div>

      <div className="my-8 text-center">
        <span className="text-xs block mb-2">Advertisement</span>
        <Adu
          adSlot="9995634858"
          adFormat="auto"
          style={{ display: "inline-block", width: "300px", height: "250px" }}
        />
      </div>

      <div className="prose max-w-none mb-8">
        {article.outro?.length ? (
          <PortableText value={article.outro} />
        ) : (
          <p className="text-gray-600">No conclusion available.</p>
        )}
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="font-semibold mb-2">Written by:</h3>
        {article.author?.length ? (
          article.author.map((author) => (
            <Link
              key={author._id}
              href={`/author/${author.slug.current}`}
              className="text-blue-500 hover:underline mr-2"
            >
              {author.name}
            </Link>
          ))
        ) : (
          <span className="text-gray-600">Unknown author</span>
        )}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Categories:</h3>
        {article.categories?.length ? (
          article.categories.map((category) => (
            <span
              key={category._id}
              className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm mr-2 mb-2"
            >
              {category.title}
            </span>
          ))
        ) : (
          <span className="text-gray-600">No categories</span>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsArticle;