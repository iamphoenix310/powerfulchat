import { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about Powerful — a creative platform where users can upload, sell, and share premium digital content like images, PDFs, and ZIPs.',
};

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-center">About Us</h2>

      <p className="mt-4 text-lg text-gray-700">
        <strong>Powerful by Powerful Creations</strong> is a platform built for digital creators. We empower users to upload and sell their premium content — including high-quality images, PDFs, ZIP files, and more — while maintaining full control over pricing and access.
      </p>

      <p className="mt-6 text-lg text-gray-700">
        Whether you are an AI artist, photographer, graphic designer, or educator, you can monetize your digital assets and reach a growing audience through our creator-first ecosystem.
        Each upload can be freely accessible or locked behind a secure paywall. You decide how your work is shared and sold.
      </p>

      <p className="mt-6 text-lg text-gray-700">
        Our platform handles everything from hosting and secure payment processing (Razorpay, PhonePe) to unlocking downloads only after purchase. We ensure creators keep a fair share of the revenue — and buyers get instant access to their files.
      </p>

      <p className="mt-6 text-lg text-gray-700">
        With powerful tools like tags, alt text, search visibility optimization, and real-time insights coming soon, we are making it easier than ever to grow your digital storefront and audience from anywhere.
      </p>

      <p className="mt-6 text-lg text-gray-700">
        As we evolve, we are focused on building a creator-centric, minimal, and scalable ecosystem. From solo artists to commercial creators — if you are serious about sharing your work online, Powerful is for you.
      </p>

      <p className="mt-6 text-lg text-gray-700">
        For any questions, feedback, or support, reach out at 
        <a href="mailto:contact@visitpowerful.com" className="text-indigo-600 underline"> contact@visitpowerful.com</a>.
      </p>

      <p className="mt-8 text-center text-gray-600">
        Build. Share. Earn. 🔥
      </p>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">AI-Generated Content – Disclaimer</h2>
        <p className="mt-2 text-gray-600">
          Some content on Powerful may be generated using AI tools and is intended for conceptual, educational, or artistic purposes only. This includes fictional scenes and celebrity likenesses used in stylized ways.
        </p>
        <p className="mt-2 text-gray-600">
          If you have concerns regarding any image or file, please reach out to us directly.
        </p>
      </section>
    </div>
  );
};

export default AboutUs;
