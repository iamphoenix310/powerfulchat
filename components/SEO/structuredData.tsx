'use client';
import React from 'react';

interface StructuredDataProps {
  imageUrl: string;
  title: string;
  description: string;
  createdAt: string;
  creatorName?: string;
}

const StructuredData: React.FC<StructuredDataProps> = ({
  imageUrl,
  title,
  description,
  createdAt,
  creatorName,
}) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: imageUrl,
    name: title,
    description,
    uploadDate: createdAt,
    representativeOfPage: true,
    creditText: creatorName ? `Uploaded by ${creatorName}` : "Uploaded by Powerful user",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default StructuredData;
