"use client"
import React, { useEffect, useState, useRef } from 'react';
import { client, urlFor } from '@/app/utils/sanityClient';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import Adu from '@/components/GooAds/Adu';
import { SuperSEO } from 'react-super-seo';
import { PortableText } from '@portabletext/react';
import { saveAs } from 'file-saver';
import SimilarWallpapers from '@/components/SimilarWallpapers/SimilarWallpapers';
import { LoginModal } from '@/components/GoogleLogin/LoginModel';

interface WallpaperResolution {
  height: number;
  width: number;
  label: string;
  url: string;
}

interface WallpaperDetail {
  body: string[];
  text: any;
  title: string;
  description: string;
  tags: string[];
  image: {
    asset: {
      _ref: string;
    };
  };
  
  resolutions: WallpaperResolution[];
}

interface WallpaperDetailProps {
  
    cuteWalls: string;
  
}

interface SimilarWallpaper {
  title: string;
  slug: {
    current: string;
  };
  image: {
    asset: {
      _ref: string;
    };
  };
}


const Wallpaper: React.FC<WallpaperDetailProps> = ({ cuteWalls }) => {
    
    const { cuteWalls: cuteSlug } = { cuteWalls }; // Destructure to extract the slug

  const [wallpaperDetail, setWallpaperDetail] = useState<WallpaperDetail | null>(null);
  const [error, setError] = useState<string>('');
  const downloadButtonRef = useRef<HTMLButtonElement>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedResolutionUrl, setSelectedResolutionUrl] = useState<string>('');
  const [downloadInitiated, setDownloadInitiated] = useState(false); // Add state to track download initiation
  const [buttonText, setButtonText] = useState('Download');
  const [downloadButtonDisabled, setDownloadButtonDisabled] = useState(true);
  const [selectedResolutionLabel, setSelectedResolutionLabel] = useState<string>('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adSize, setAdSize] = useState({ width: '728px', height: '90px' });

  useEffect(() => {
    if (window.innerWidth < 600) {
        setAdSize({ width: '300px', height: '250px' });
    }
}, []);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchWallpaperData = async () => {
      try {
        const response = await client.fetch(
          `*[_type == "wallpaper" && slug.current == $cuteSlug][0]{
            title,
            description,
            tags,
            body,
            image,
            "resolutions": resolutions[]{
              label,
              "url": file.asset->url
            }
          }`,
          { cuteSlug }
        );

        if (response) {
          setWallpaperDetail(response);
          // setSelectedResolutionUrl(response.resolutions[0]?.url || ''); // Set the default resolution URL
        }
      } catch (error) {
        console.error('Error fetching wallpaper data', error);
        setError('Failed to load wallpaper data.');
      }
    };

    fetchWallpaperData();
  }, [cuteSlug]);
  
  useEffect(() => {
    // Cleanup function to clear interval if component unmounts
    return () => {
      clearInterval(intervalRef.current ?? 0);
    };
  }, []);


  const handleResolutionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const resolutionUrl = event.target.value;
    setSelectedResolutionUrl(resolutionUrl);
    setDownloadProgress(0);
    setDownloadButtonDisabled(resolutionUrl === '');
  };
  
  

  useEffect(() => {
    if (selectedResolutionUrl && downloadInitiated) {
      initiateDownload(selectedResolutionUrl, selectedResolutionLabel); // Pass both URL and label
    }
  }, [selectedResolutionUrl, downloadInitiated, selectedResolutionLabel]);
  
  const { data: session } = useSession(); // Session line

  const handleDownload = async () => {
    // if (!session) {
    //   // User is not logged in
    //   setShowLoginModal(true);
    //   return;
    // }
    if (!downloadButtonRef.current || !selectedResolutionUrl) return;
  
    downloadButtonRef.current.disabled = true;
    let currentProgress = 0;
    const totalDuration = 41; // 50 seconds
    const increment = 100 / totalDuration; // Increment for each second

    intervalRef.current = setInterval(() => {
      currentProgress += increment;
      setDownloadProgress(currentProgress);
      setButtonText(`Preparing ${Math.round(currentProgress)}%`);

      if (currentProgress >= 100) {
        clearInterval(intervalRef.current!);
        initiateDownload(selectedResolutionUrl, selectedResolutionLabel); // Pass the resolution label
        setButtonText('Download');
        if (downloadButtonRef.current) {
          downloadButtonRef.current.disabled = false; // Corrected line
        }
      }
    }, 1000);
  };
 
  const initiateDownload = (url: string, selectedResolutionLabel: string) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const fileName = `downloaded_wallpaper_${selectedResolutionLabel}.jpg`;
        saveAs(blob, fileName);        
      })
      .catch(err => console.error('Error downloading image:', err));
  };
  
 
  useEffect(() => {
    if (downloadProgress >= 100 && downloadButtonRef.current) {
      downloadButtonRef.current.disabled = false;
    }
  }, [downloadProgress]);

  if (error) {
    return <div>Error: {error}</div>;
  }
  
  
  return (
    <>
    {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      {wallpaperDetail && <SuperSEO title={wallpaperDetail.title} description={wallpaperDetail.description} />}
      <div className='mx-auto max-w-4xl p-4'>
      <div className='flex flex-col justify-center items-center mt-5 mb-2'>
            <span className='text-xs text-center'>Advertisement</span>
            <Adu adSlot="5382119347"
                 adFormat="auto"
                 style={{ display: 'inline-block', ...adSize }} />
        </div>
        {wallpaperDetail ? (
          <>
            <h1 className='text-3xl font-bold text-gray-800 mb-4'>{wallpaperDetail.title}</h1>
            <Link href={`/wallpapers/cute-wallpapers`}>Back</Link>
            {wallpaperDetail.image && (
              <div className='flex justify-center mb-7'>
                <Image src={urlFor(wallpaperDetail.image)} alt={wallpaperDetail.title} width={780} height={500} className='rounded-lg shadow-lg' />
              </div>
            )}
            <span className='text-gray-600 mt-8'><PortableText value={wallpaperDetail.body as any} /></span>
            <div className='mt-2 mb-4 text-sm text-gray-500'>Tags: {wallpaperDetail.tags.join(' ')}</div>
            
            <div className='flex flex-col justify-center items-center mt-5 mb-2'>
                              <span className='text-xs text-center'>Advertisement</span>
                              <Adu adSlot="9995634858"
                              adFormat="auto"
                              style={{ display: 'inline-block', width: '300px', height: '250px' }} />
                          </div>

                          <div className="flex flex-col justify-center items-center my-4">
                          <select
                        onChange={handleResolutionChange}
                        className="mb-4 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      >
                        <option value="" key="select-resolution">Select Resolution</option>
                        {wallpaperDetail?.resolutions.map((resolution, index) => (
                          <option key={`resolution-${index}`} value={resolution.url}>
                            {resolution.label}
                          </option>
                        ))}
                      </select>

        <button
          ref={downloadButtonRef}
          onClick={handleDownload}
          disabled={false}
          className="relative bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {downloadProgress > 0 ? (
            <>
              <div className="relative w-full h-2 bg-blue-300 rounded">
                <div className="absolute h-2 bg-blue-500" style={{ width: `${downloadProgress}%` }}></div>
              </div>
              <span className="relative -mt-3">{buttonText}</span>
            </>
          ) : (
            'Download'
          )}
        </button>
      </div>
     
      <div className='flex flex-col justify-center items-center my-4 mb-4'>
        <span>For mobile phones, select any resolution from  720x1280 or 1080x1920 or 1440x2560.</span>
        <br />
        <p>Rest of the resolutions are for Desktop or Laptop screens.</p>
      </div>

      
      <div className='text-xs text-gray-500 mt-5 flex justify-center items-center'>
        Support Us Based on What You Think This Wallpaper is Worth</div>
      <div className="flex justify-center items-center mt-4 mb-4">
                           <a href={'https://razorpay.me/@powerfulcreations'} target='_blank'>
                            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                                Support Here
                            </button>
                           </a>
                        </div>
     <SimilarWallpapers 
     category='7fdbb64b-17ec-4bdb-b628-ec5a7d2cff0d'
     categorySlug='cute-wallpapers'
     />
          </>
        ) : (
          
          <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
          </div>
        )}
      </div>
    </>
  );
};

export default Wallpaper;
