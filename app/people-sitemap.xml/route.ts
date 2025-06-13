import { client, urlFor } from '@/app/utils/sanityClient'; // Assuming sanityClient.ts is here
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://visitpowerful.com'

// Helper function to escape ampersands in URLs for XML
function escapeUrlForXml(unsafeUrl: string): string {
  if (typeof unsafeUrl !== 'string') {
    return ''; // Or handle as an error, or return a placeholder
  }
  return unsafeUrl.replace(/&/g, '&amp;');
}

// Helper function to escape special XML characters in text content (like captions)
function escapeTextForXml(unsafeText: string): string {
  if (typeof unsafeText !== 'string') {
    return '';
  }
  return unsafeText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Define a more specific type for items if possible, based on your SanityPerson and query
interface SitemapPersonItem {
  slug: { current: string };
  _updatedAt: string;
  image?: {
    asset?: any; // Define more strictly if you have the SanityImageReference type
    alt?: string;
  };
}

function generatePeopleSitemapXml(items: SitemapPersonItem[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  items.forEach(item => {
    if (!item.slug || !item.slug.current) {
      console.warn('Skipping item due to missing slug:', item);
      return; // Skip items that don't have a slug
    }

    const pageLoc = `${BASE_URL}/people/${item.slug.current}`;
    xml += `
      <url>
        <loc>${escapeUrlForXml(pageLoc)}</loc>
        <lastmod>${new Date(item._updatedAt).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>`;

    if (item.image?.asset) {
      const imageUrlString = urlFor(item.image); // Assuming urlFor(item.image) returns a string URL
      if (typeof imageUrlString === 'string' && imageUrlString) {
        xml += `
        <image:image>
          <image:loc>${escapeUrlForXml(imageUrlString)}</image:loc>
          ${item.image.alt ? `<image:caption>${escapeTextForXml(item.image.alt)}</image:caption>` : ''}
        </image:image>`;
      } else {
        console.warn('Skipping image for item due to invalid URL:', item.slug.current, imageUrlString);
      }
    }
    xml += `
      </url>
    `;
  });

  xml += `</urlset>`;
  return xml;
}


export async function GET(request: NextRequest) {
  try {
    // Ensure your query fetches 'alt' text if it's part of your image object in Sanity
    // Example: image{asset, alt}
    const people: SitemapPersonItem[] = await client.fetch(
      `*[_type == "facesCelebs" && defined(slug.current) && !(_id in path("drafts.**"))]{ 
        "slug": slug, 
        _updatedAt, 
        image {
          asset, 
          alt 
        } 
      }`
    );

    if (!people) { // Handle case where fetch might return null/undefined if an error occurs in client
        console.error("Failed to fetch people data, received null or undefined.");
        return new NextResponse("<error>Could not generate sitemap: data fetch failed</error>", {
         status: 500,
         headers: { 'Content-Type': 'application/xml' },
       });
    }
    
    const sitemapContent = generatePeopleSitemapXml(people);

    return new NextResponse(sitemapContent, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error("Error generating people sitemap:", error);
    const errorDetails = error instanceof Error ? error.message : String(error);
    return new NextResponse(`<error>Could not generate sitemap: ${escapeTextForXml(errorDetails)}</error>`, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}