import Link from "next/link";
import Image from "next/image";

type NewsCardProps = {
  slug: string;
  title: string;
  mainImage?: { asset: { url: string } };
  publishedAt?: string;
  excerpt?: string;
  intro?: string; // ✅ Made optional
};

const NewsCard: React.FC<NewsCardProps> = ({ title, slug, mainImage, publishedAt, intro }) => {
  return (
    <div className="news-card border rounded-lg p-4 shadow-md">
      {mainImage && (
        <div className="relative w-full h-48">
          <Image
            src={mainImage.asset.url}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        </div>
      )}
      <h2 className="text-xl font-bold mt-2">{title}</h2>
      {publishedAt && <p className="text-gray-500 text-sm">{new Date(publishedAt).toDateString()}</p>}
      {intro && <p className="mt-2 text-gray-700">{intro}</p>}
      <Link href={`/news/${slug}`} className="text-blue-600 hover:underline mt-3 block">
        Read more
      </Link>
    </div>
  );
};

export default NewsCard;