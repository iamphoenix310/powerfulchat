import { client } from "@/app/utils/sanityClient";

export async function getArticles() {
  return client.fetch(
    `*[_type == "articles"] | order(publishedAt desc) {
      title,
      slug,
      mainImage,
      intro,
      publishedAt
    }`
  );
}

export async function getArticle(slug: string) {
  return client.fetch(
    `*[_type == "articles" && slug.current == $slug][0] {
      title,
      subtitle,
      mainImage,
      body,
      publishedAt,
      readingTime
    }`,
    { slug }
  );
}