'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpTrayIcon,
  CurrencyRupeeIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    title: '1. Upload Premium Content',
    icon: ArrowUpTrayIcon,
    description:
      'Submit high-quality images, PDFs, or ZIP files. From AI art to ebooks and design assets — everything premium is welcome.',
  },
  {
    title: '2. Set Your Own Price',
    icon: LockClosedIcon,
    description:
      'Choose to sell your content or offer it for free. Secure downloads are enabled after payment is completed.',
  },
  {
    title: '3. Earn Consistent Income',
    icon: CurrencyRupeeIcon,
    description:
      'Receive 95% of each sale directly to your account. Plus, earn from ads if your content is publicly visible.',
  },
];

const UploadAndEarnSection = () => {
  return (
    <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Earn from Your Creative Work
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-10">
          Upload premium images, PDFs, or ZIPs. Set prices or offer for free — get paid fairly with every download or view.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map(({ title, description, icon: Icon }, idx) => (
          <motion.div
            key={idx}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition"
            whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Icon className="h-10 w-10 text-blue-600 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">{title}</h3>
            <p className="text-gray-600 text-sm text-center">{description}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <a
          href="/upload"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-base font-medium transition"
        >
          Start Uploading
        </a>
      </div>
    </section>
  );
};

export default UploadAndEarnSection;
