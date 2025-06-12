"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { client, urlFor } from '@/app/utils/sanityClient';
import { PortableText } from '@portabletext/react';
import Adu  from '@/components/GooAds/Adu';
import { LoginModal } from "@/components/GoogleLogin/LoginModel";
import { useSession } from 'next-auth/react';
import Link from 'next/link';

interface Story {
  category: any;
  aiAssistant: string;
  body: any;
  title: string;
  author: string;
  date: string;
  completed: boolean;
  soundtrack: Array<{
    title: string;
    url: string;
  }>;
  slug: {
    current: string;
  };
  featuredImage: {
    asset: {
      url: string;
    };
  };
  images: Array<{
    description: any;
    _id: string;
    subHeadline: string;
    image: {
      asset: {
        url: string;
      };
    };
    body: any;
  }>;
}

interface StoryPageProps {
    storySlug: string;
}

// ... (imports and interfaces remain the same)

const StoryPage: React.FC<StoryPageProps> = ({ storySlug }) => {
    const { data: session } = useSession();
    const storySingleSlug = storySlug;
    const [oneStory, setOneStory] = useState<Story | null>(null);
    const [loadedImages, setLoadedImages] = useState<number>(3);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showLoginModal, setShowLoginModal] = useState(false);

  
    useEffect(() => {
      if (storySingleSlug) {
        client
          .fetch(`*[_type == "stories" && slug.current == $storySingleSlug && !(_id in path("drafts.**"))] | order(_createdAt desc)  {title, slug, author, date, aiAssistant, completed, featuredImage, "category": category[]->{_id, name}, images[] {subHeadline, image, description}, soundtrack[]{title, url}}`, { storySingleSlug })
          .then((data) => setOneStory(data[0] as Story))
          .catch((error: Error) => console.error('Error fetching data:', error));
      }
    }, [storySingleSlug]);
  
    const loadMoreImages = () => {
      // Increase the number of loaded images by 3 when the "Continue" button is clicked
      if (!session) {
        setShowLoginModal(true);
        return;
      }
      setLoadedImages((prevLoadedImages) => prevLoadedImages + 3);
    };
  
    if (!oneStory) {
      return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>;
    }
    return (
        <>
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  <h1 className="text-3xl font-semibold mb-4 text-center mt-5">{oneStory.title}</h1>
  <div className="text-gray-600 mb-4 flex flex-col sm:flex-row justify-center items-center text-center sm:text-left">
    <p className="px-4 py-2 text-gray-700 mb-3 sm:mb-0">
      <strong>Category</strong>: {oneStory.category?.map((category: { name: any; }) => category.name).join(', ')}
    </p>
    <p className="px-4 py-2 text-gray-700 mb-3 sm:mb-0 sm:ml-5">
      <strong>Author</strong>: {oneStory.author}
    </p>
    <p className="px-4 py-2 text-gray-700 mb-3 sm:mb-0 sm:ml-5">
      <strong>AI Assistant</strong>: {oneStory.aiAssistant}
    </p>
    <p className="px-4 py-2 text-gray-700 sm:ml-5">
      <strong>Published:</strong> {`${new Date(oneStory.date).toLocaleDateString()}`}
    </p>
  </div>

  {/* Add official Soundtrack Links with Title */}
 


  {oneStory.featuredImage && (
    <div className="mb-6 flex justify-center">
      <Image
        src={urlFor(oneStory.featuredImage)}
        alt={oneStory.title}
        width={700}
        height={300}
        className="rounded-lg shadow-md"
      />
    </div>
  )}
<div className="bg-white p-8 shadow-lg rounded-lg flex flex-col items-center justify-center">
  {oneStory.soundtrack && oneStory.soundtrack.length > 0 ? (
    <div className="flex flex-col justify-center items-center mt-5 mb-2">
      <Link href={oneStory.soundtrack[0]?.url} className="group relative" target='_blank'>
        <span className="text-2xl text-center font-extrabold text-blue-500 uppercase tracking-wide transition-transform duration-300 transform group-hover:scale-110">
          Official Soundtracks
        </span>
        {/* Add a futuristic glowing effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 opacity-30 blur-md rounded-lg group-hover:opacity-50"></div>
      </Link>
    </div>
  ) : (
    <div className="flex flex-col justify-center items-center mt-5 mb-2">
      <span className="text-lg text-gray-400 italic">Soundtracks Not Available Yet</span>
    </div>
  )}
</div>


{oneStory.images.slice(0, loadedImages).map((image, index) => (
    <React.Fragment key={image._id}>
      <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden mb-20">
        <div className="w-full md:w-1/2">
          <Image
            src={urlFor(image.image)}
            alt={image.description}
            width={400}
            height={300}
            className="object-cover w-full"
          />
        </div>
        <div className="w-full md:w-1/2 p-4">
          <h2 className="text-xl font-semibold mb-2">{image.subHeadline}</h2>
          <PortableText value={image.description} />
        </div>
      </div>
      {/* Insert the ad after every two image/description pairs */}
      {(index + 1) % 2 === 0 && index < loadedImages - 1 && (
        <div className='flex flex-col justify-center items-center mt-5 mb-2'>
          <span className='text-xs text-center'>Advertisement</span>
          <Adu adSlot="9995634858"
              adFormat="auto"
              style={{ display: 'inline-block', width: '300px', height: '250px' }} />
        </div>
      )}
    </React.Fragment>
  ))}

  {loadedImages < oneStory.images.length && (
    <button
      onClick={loadMoreImages}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 mx-auto block"
    >
      Continue
    </button>
  )}
</div>

 {/* Show the login modal if user is not logged in and clicked ask button */}
 {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}

<div className='flex flex-col justify-center items-center mt-5 mb-2'>
  <span className='text-xs text-center'>Advertisement</span>
  <Adu adSlot="9995634858"
    adFormat="auto"
    style={{ display: 'inline-block', width: '300px', height: '250px' }} />
</div>

      </>
    );
  };
  
  export default StoryPage;
  