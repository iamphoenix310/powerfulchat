"use client"
import React, { useEffect, useState } from 'react';
import { client, urlFor } from '@/app/utils/sanityClient';
import Image from 'next/image';
import Link from 'next/link';

const Stories = () => {
    const [stories, setStories] = useState<any[]>([]); // You should replace 'any' with a more specific type
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {
        const fetchData = async () => {
          try {
            const data = await client.fetch('*[_type == "stories" && _updatedAt < now()]|order(_updatedAt desc)[0...3]{title, slug, featuredImage, _id, author, aiAssistant, "category": category[]->{_id, name}}');
            setStories(data);
            setIsLoading(false);
          } catch (error) {
            console.error('Error fetching data from Sanity:', error);
            setIsLoading(false);
          }
        };
    
        fetchData();
      }, []);

return (
    <>
    {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
       
    <div className="bg-gray-100 min-h-fit py-6 px-4 sm:px-6 lg:px-8">
      {/* <div className='flex justify-center items-center mt-2 mb-2 md:w-1/2 lg:w-1/3'>
        <Adsense adSlot='2013719979' />
      </div> */}

    <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Short Stories</h1>
    <p>Read amazing short stories with stunning and high quality visuals.</p>
    <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-4">
      {stories.map((story) => (
        <div key={story._id} className="bg-white p-6 rounded-lg shadow-md">
          
          <div className="mt-4">
          <Link href={`/stories/${story.slug.current}`}>
            <Image
              src={urlFor(story.featuredImage) || ''}
              alt={story.title}
              width={500}
              height={500}
              className="rounded-lg"
            />
            </Link>
          </div>
          <Link href={`/stories/${story.slug.current}`}>
          <h2 className="text-2xl font-semibold text-gray-900 mt-2">{story.title}</h2>
          </Link>
          {/* Replace 'story.description' with the actual description field */}
          <p className='mt-2'>{story.category.map((category: any) => category.name).join(', ')}</p>
          <p className='mt-2'><strong> Author</strong>: {story.author}</p>
          <p className='mt-2'><strong>AI Assistant</strong>: {story.aiAssistant}</p>

          {/* Add more fields from your Sanity schema as needed */}
          
        </div>
      ))}
    </ul>
    <div className="text-right mt-4">
        <Link href={'/stories'}>
          <span className="text-blue-500 hover:text-blue-700">View All Stories</span>
        </Link>
      </div>
  </div>
  
      )}
  </>
  );
};

export default Stories;
