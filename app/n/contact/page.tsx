import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact Us - Powerful Creations',
  description: 'Reach out to Powerful Creations. Find our contact details, address, GST info and more.',
};

const ContactUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-white bg-gradient-to-br from-black via-neutral-900 to-zinc-800 rounded-lg shadow-2xl border border-neutral-700">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 border-b border-neutral-700 pb-4">
        Contact Us
      </h1>

      <div className="space-y-4 text-base md:text-lg leading-relaxed">
        <p>
          <span className="text-neutral-400">Company:</span>{' '}
          <span className="font-medium">Powerful Creations</span>
        </p>
        <p>
          <span className="text-neutral-400">Email:</span>{' '}
          <a href="mailto:contact@visitpowerful.com" className="text-blue-400 hover:underline">
            contact@visitpowerful.com
          </a>
        </p>
        <p>
          <span className="text-neutral-400">Phone:</span>{' '}
          <a href="tel:+919988020120" className="text-blue-400 hover:underline">
            +91 99880 20120
          </a>
        </p>
        <p>
          <span className="text-neutral-400">Address:</span><br />
          B-6-105, Street Number 1,<br />
          Old Madhopuri Chowk,<br />
          Ludhiana, Punjab, 141008
        </p>
        <p>
          <span className="text-neutral-400">GST Number:</span>{' '}
          03BEHPS4838C1ZL
        </p>
        <p className="text-sm text-white text-neutral-500 mt-6">
          We strive to respond to all emails within <span className="font-semibold text-white">4–5 hours</span>.
        </p>
        <p className="mt-10 text-sm text-neutral-400 italic">
          This platform is proudly associated with{' '}
          <a
            href="https://overallsite.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Overallsite.com
          </a>{' '}
          — a creative powerhouse dedicated to empowering digital creators.
        </p>
      </div>
    </div>
  );
};

export default ContactUs;