'use client';

import React, { useState, useEffect } from 'react';
import { client } from '@/app/utils/sanityClient';
import groq from 'groq';
import Adu from '@/components/GooAds/Adu';
import Image from 'next/image';
import Link from 'next/link';

interface Image {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  caption: string;
  tags: string[];
  slug: { current: string };
}

const fetchImages = async () => {
  const query = groq`
    *[_type == "images"] | order(_createdAt desc) {
      _id,
      title,
      description,
      "imageUrl": image.asset->url,
      alt,
      caption,
      tags,
      slug
    }
  `;
  return await client.fetch(query) as Image[];
};

export default function ImageFeed() {
  const [images, setImages] = useState<Image[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    fetchImages().then(setImages).catch(console.error);
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleScroll = (dir: 'next' | 'prev') => {
    if (timer === 0) {
      const nextIndex = dir === 'next' ? activeIndex + 1 : activeIndex - 1;
      if (nextIndex >= 0 && nextIndex < images.length) {
        setActiveIndex(nextIndex);
        setTimer(30); // reset timer
      }
    }
  };

  const currentImage = images[activeIndex];

  return (
    <>
      <div className="text-center mt-6">
        <h1 className="text-2xl font-bold">See Amazing Photos</h1>
        <p className="text-gray-600 mt-1">Check out new fascinating images daily here!</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* IMAGE */}
        {currentImage && (
          <div className="flex justify-center lg:justify-start">
            <div className="relative aspect-[2/3] w-[70vw] sm:w-[70vw] md:w-[60vw] lg:w-full max-w-lg rounded-lg overflow-hidden shadow">
              <Image
                src={currentImage.imageUrl}
                alt={currentImage.alt}
                fill
                sizes="(max-width: 768px) 90vw, 600px"
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* RIGHT COLUMN */}
        <div className="flex flex-col items-center gap-4 lg:mt-0 mt-6 px-4 w-full">
          {/* Title */}
          <p className="text-lg font-semibold text-center">{currentImage?.title}</p>

          {/* Countdown Timer */}
          {timer > 0 && (
            <p className="text-sm text-red-600 font-medium">
              ⏳ Unlocking in {timer} second{timer !== 1 && 's'}...
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-4 flex-wrap justify-center mt-2">
            <button
              onClick={() => handleScroll('prev')}
              disabled={timer > 0}
              className={`px-5 py-2 rounded font-semibold transition ${
                timer > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handleScroll('next')}
              disabled={timer > 0}
              className={`px-5 py-2 rounded font-semibold transition ${
                timer > 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>

          {/* Ad BELOW buttons */}
          <div className="w-full max-w-sm h-[250px] border border-gray-200 mt-4 mb-8 flex items-center justify-center">
            <Adu
              adSlot="9995634858"
              adFormat="auto"
              style={{ display: 'inline-block', width: '300px', height: '250px' }}
            />
          </div>
        </div>
      </div>

      {/* Middle Ad */}
      <div className="w-full py-10 flex justify-center">
        <Adu
          adSlot="9995634858"
          adFormat="auto"
          style={{ display: 'inline-block', width: '728px', height: '90px' }}
        />
      </div>

      {/* Related Images or Timer Text */}
      {timer > 0 ? (
        <p className="text-center text-gray-600 mt-4">{timer} seconds remaining to unlock more images</p>
      ) : (
        <div className="max-w-7xl mx-auto px-4 mt-10">
          <h2 className="text-xl font-bold mb-4 text-center">More Similar Images</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {images
              .filter((_, i) => i !== activeIndex)
              .slice(0, 10)
              .map((img) => (
                <Link key={img._id} href={`/images/${img.slug.current}`}>
                  <div className="relative aspect-[2/3] w-full rounded overflow-hidden hover:scale-105 transition">
                    <Image
                      src={img.imageUrl}
                      alt={img.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 200px"
                      className="object-cover"
                    />
                  </div>
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* Final Ad */}
      <div className="w-full py-10 flex justify-center">
        <Adu
          adSlot="9995634858"
          adFormat="auto"
          style={{ display: 'inline-block', width: '300px', height: '250px' }}
        />
      </div>
    </>
  );
}