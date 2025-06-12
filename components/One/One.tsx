"use client"
import React, { useState, useEffect } from 'react';
import { client } from '@/app/utils/sanityClient'; // Adjust the import path as necessary
import groq from 'groq';
import Adu from '@/components/GooAds/Adu';
import debounce from 'lodash/debounce'; // Assuming you have lodash installed
import Image from 'next/image';

interface Image {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  alt: string;
  caption: string;
  slug: { current: string };
  tags: string[];
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
      slug,
      tags
    }
  `;
  return await client.fetch(query) as Image[];
};

export default function One() {
    const [images, setImages] = useState<Image[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [timer, setTimer] = useState(60);
    const [isMobile, setIsMobile] = useState(false);
  
    useEffect(() => {
      // Debounce the resize event
      const handleResize = debounce(() => {
        setIsMobile(window.innerWidth < 1024);
      }, 100);
  
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        handleResize.cancel();
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      fetchImages().then(setImages).catch(console.error);
    }, []);
  
    useEffect(() => {
      if (images.length > 0) {
        const countdown = setInterval(() => {
          setTimer((prevTimer) => {
            if (prevTimer === 0) {
              // Reset timer to 60 seconds and switch to the next image
              setActiveIndex((prevActiveIndex) => (prevActiveIndex + 1) % images.length);
              return 60;
            }
            return prevTimer - 1;
          });
        }, 1000);
  
        // Cleanup the interval on component unmount
        return () => clearInterval(countdown);
      }
    }, [images, activeIndex]);

  return (
    <>
<div className="flex flex-col lg:grid lg:grid-cols-1 lg:gap-x-5 bg-white font-sans min-h-screen">
      {/* Top ad banner - shown on desktop and resized on mobile */}
      <div className="w-full flex justify-center my-4">
      <div className="w-auto">

        <Adu 
          adSlot="9995634858"
          adFormat="auto"
          style={{ width: isMobile ? '300px' : '728px', height: isMobile ? '250px' : '90px' }}
        />
      </div>
      </div>

      {/* Left sidebar ad - shown only on large screens */}
      <div className="hidden lg:flex lg:flex-col lg:items-end lg:justify-center lg:w-auto lg:px-1 lg:fixed lg:left-5 top-1/2 lg:-translate-y-1/2">
        <Adu adSlot="9995634858" adFormat="auto" style={{ width: '160px', height: '600px' }} />
      </div>

      {/* Main content area */}
      <div className="flex-grow flex flex-col items-center lg:mx-20 lg:px-5">        
      <h1 className="text-2xl font-bold my-4 text-center">New Image After Every Minute</h1>
        <span className='mb-3'>Daily Updates</span>
        {images.length > 0 && (
          <div className="w-full flex justify-center">
            <Image
              src={images[activeIndex].imageUrl}
              alt={images[activeIndex].alt}
              className="max-h-[60vh] w-auto object-contain"
            />
          </div>
        )}
        <p className="text-center my-4 font-bold">{images.length > 0 ? images[activeIndex].title : ''}</p>
        <p className="text-center my-4">Next image in {timer} seconds</p>
      </div>

      {/* Right sidebar ad - shown only on large screens */}
      <div className="hidden lg:flex lg:flex-col lg:items-start lg:justify-center lg:w-auto lg:px-1 lg:fixed lg:right-5 top-1/2 lg:-translate-y-1/2">
        <Adu adSlot="9995634858" adFormat="auto" style={{ width: '160px', height: '600px' }} />
      </div>

      {/* Bottom ad banner - different sizes for mobile and desktop, but only shown on mobile */}
      <div className="w-full lg:hidden">
        <Adu 
          adSlot="9995634858"
          adFormat="auto"
          style={{ width: '300px', height: '250px' }}
        />
      </div>
    </div>
    </>
  );
}
