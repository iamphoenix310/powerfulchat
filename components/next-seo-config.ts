// next-seo.config.ts
import { DefaultSeoProps } from 'next-seo';

const SEO: DefaultSeoProps = {
  openGraph: {
    type: 'website',
    locale: 'en_IE',
    url: 'https://visitpowerful.com/',
    site_name: 'Powerful',
    title: 'Powerful Stories, Beautiful Images and A.I. Powered Image Creation Tool',
    description: 'Powerful is a platform for creating beautiful images, stories, and websites with A.I. powered image creation tool.',
  },
//   My website twitter handle is @powerfulcreat
  twitter: {
    handle: '@powerfulcreat',
    site: '@powerfulcreat',
    cardType: 'summary_large_image',
  },
  // Additional SEO configurations...
};

export default SEO;
