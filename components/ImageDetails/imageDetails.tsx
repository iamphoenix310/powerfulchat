"use client"
import { client, urlFor } from '@/app/utils/sanityClient';
import { LoginModal } from '@/components/GoogleLogin/LoginModel';
import StructuredData from '@/components/SEO/structuredData';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FacebookIcon, FacebookShareButton, TwitterShareButton, WhatsappIcon, WhatsappShareButton, XIcon } from 'react-share';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CommentList from '../Comments/commentList';
// import PromptBlock from './PromptBlock';
import JoinTelegramMobile from '@/components/ImageDetails/Home/joinTelegramMobile';
import { Audiowide } from 'next/font/google';
import DownloadSection from './DownloadSection';
const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });


import AdBlock from '@/components/Ads/AdBlock';
import LikeButton from './LikeButton';
import PromptBlock from './PromptBlock';


// import CommentForm from '../Comments/commentForm';

interface AttachedFile {
  url: string
  name: string
  size?: number
  type?: string
  uploadedAt?: string
}


export interface ImageDetailProps {
    _id: string;
    title: string;
    slug: { current: string };
    image: any; // Replace with appropriate type
    likes: number;
    description: string;
    isPremium: boolean;
    tags?: string[];
    views: number;
    _createdAt: string;
    canonical: string;
    ogUrl: string;
    likedBy: { _ref: string }[] // ✅ Add this line
    creator?: {
      _id: string;
      username: string;
      email?: string;
      image?: any;
    };    
    alt: string;
    prompt: string;
    category?: {
      _ref: string;
      _type: string;
    };
    downloadMode?: 'free' | 'paid';
  price?: number;
  unlockAfterPurchase?: boolean;
  attachedFiles?: {
    name: string;
    url: string;
    asset: {
      _ref: string;
      _type: 'reference';
    };
  }[];
}
interface PatchFunction {
  inc: (fields: Record<string, number>) => PatchFunction;
  // Add other methods you use from the patch API
  // ...
}

const ImageDetailComponent = ({ imageSlug }: { imageSlug: string }) => {
    const [imageDetail, setImageDetail] = useState<ImageDetailProps | null>(null);
    const [similarImages, setSimilarImages] = useState<ImageDetailProps[]>([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add isLoading state
    const [copied, setCopied] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false)
    const [showPayPal, setShowPayPal] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null)
    const { data: session } = useSession(); // Add this line to get the current session
    const [isSubscriptionFree, setIsSubscriptionFree] = useState(false);


  // Fetch image detail and similar images
  useEffect(() => {
    if (typeof imageSlug !== 'string') return;
  
    const query = `*[_type == "images" && slug.current == $image][0] {
      _id, title, slug, image, likes, views, description, tags, alt, category, prompt, likedBy,
      downloadMode, price, unlockAfterPurchase, isPremium,
      attachedFiles[]{
      name,
      url,
      size,
      type,
      uploadedAt,
      asset->{
        _ref,
        originalFilename
      }
    },
      "creator": creator->{_id, username, email, image}
    }`;   
  
    client.fetch(query, { image: imageSlug }, { cache: 'no-store' }).then((data) => {

      setImageDetail(data);

  
      const imageId = data._id;
      const categoryId = data?.category?._ref;
      const currentCategoryName = data?.category?.title || '';
  
      const useCategoryFallback = currentCategoryName.toLowerCase().includes("quote");
  
      if (!categoryId) {
        console.warn("No category found");
        return setIsLoading(false);
      }
  
      if (data.tags && data.tags.length > 0 && !useCategoryFallback) {
        const tagsQuery = data.tags.map((tag: string) => `tags[] match "${tag}"`).join(" || ");
        const similarByTagsQuery = `*[_type == "images" && (${tagsQuery}) && slug.current != $image]{
          _id, title, slug, image, likes, category
        }[0...4]`;
  
        client.fetch(similarByTagsQuery, { image: imageSlug }).then((similarData) => {
          if (similarData.length >= 2) {
            setSimilarImages(similarData);
            setIsLoading(false);
          } else {
            console.log("Tag match too weak, falling back to category...");
            fetchByCategory(categoryId, imageId);
          }
        });
      } else {
        fetchByCategory(categoryId, imageId);
      }
    });
  
    const fetchByCategory = (categoryId: string, imageId: string) => {
      const similarByCategory = `*[_type == "images" && category._ref == $catId && _id != $imageId]{
        _id, title, slug, image, likes, category
      }[0...4]`;
  
      client
        .fetch(similarByCategory, { catId: categoryId, imageId })
        .then((fallbackData) => {
          setSimilarImages(fallbackData);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching category-based images:", err);
          setIsLoading(false);
        });
    };
  }, [imageSlug]);

  useEffect(() => {
    if (session && imageDetail && session?.user) {
      const checkSubscriptionFree = async () => {
        try {
          const creditsData = await client.fetch(
            `*[_type == "user" && email == $email][0].subscriptionCredits`,
            { email: session.user.email }
          );
  
          if (imageDetail.creator) {
            const creatorUsername = imageDetail.creator.username?.toLowerCase() || '';
  
            if (
              (creatorUsername === 'pankaj' || creatorUsername === 'powerful') &&
              creditsData > 50
            ) {
              setIsSubscriptionFree(true);
            } else {
              setIsSubscriptionFree(false);
            }
          } else {
            setIsSubscriptionFree(false);
          }
        } catch (err) {
          console.error('Error checking subscription-free eligibility', err);
          setIsSubscriptionFree(false);
        }
      };
  
      checkSubscriptionFree();
    }
  }, [session, imageDetail]);
  
  

  useEffect(() => {
    const checkPurchase = async () => {
      if (session?.user?.email && imageDetail?._id) {
        const res = await fetch('/api/check-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageId: imageDetail._id,
            userEmail: session.user.email,
          }),
        })
  
        const data = await res.json()
        if (data.hasPurchased) setIsUnlocked(true)
      }
    }
  
    checkPurchase()
  }, [session, imageDetail])
  
  useEffect(() => {
    const updateViews = async () => {
      if (imageDetail && !localStorage.getItem(`viewed-${imageDetail._id}`)) {
        try {
          const res = await fetch('/api/incrementViews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageId: imageDetail._id }),
          });
  
          const data = await res.json();
  
          if (data.success) {
            setImageDetail((prev) => prev ? { ...prev, views: data.views } : prev);
            localStorage.setItem(`viewed-${imageDetail._id}`, "true");
          }
        } catch (err) {
          console.error("Failed to increment views", err);
        }
      }
    };
  
    updateViews();
  }, [imageDetail]);
  
  
  
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";


  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: imageDetail?.title || "Check out this image!",
          text: "Found this amazing image! Check it out.",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      alert("Sharing is not supported on this device.");
    }
  };
  
  
  const downloadImage = async () => {
  if (!session) return setShowLoginModal(true)

  const file = imageDetail?.attachedFiles?.[0]
  const isPremium = imageDetail?.isPremium

  if (!isPremium) {
    // ✅ FREE image fallback (from Sanity image 
    if (!imageDetail) {
  toast.error('Download failed. Image not found.')
  return
}

const directUrl = urlFor(imageDetail.image).toString()

if (!directUrl || !directUrl.startsWith('http')) {
  toast.error('Download failed. Invalid image URL.')
  return
}


    try {
      const response = await fetch(directUrl)
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)

      const a = document.createElement('a')
    a.href = blobUrl
    a.download = imageDetail.title?.replace(/\s+/g, '_') || 'download'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)

      await fetch('/api/track-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: imageDetail._id }),
      })
    } catch (err) {
      console.error('❌ Free Sanity image download failed:', err)
    }

    return
  }

  // 💎 PREMIUM image logic
  if ((!isUnlocked && !isSubscriptionFree) || !file?.url) {
    toast.error('Please unlock this image before downloading.')
    return
  }

  try {
    const key = file.url.split('/').slice(4).join('/')
    const res = await fetch('/api/r2-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })

    const { signedUrl } = await res.json()

    const xhr = new XMLHttpRequest()
    xhr.responseType = 'blob'
    xhr.open('GET', signedUrl)

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100)
        setDownloadProgress(percent)
      }
    }

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const blobUrl = URL.createObjectURL(xhr.response)
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = file.name || 'premium-download'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(blobUrl)

        await fetch('/api/track-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageId: imageDetail._id }),
        })

        setDownloadProgress(null)
      } else {
        throw new Error('Failed to download premium file')
      }
    }

    xhr.onerror = () => {
      toast.error('Premium file download failed.')
      setDownloadProgress(null)
    }

    xhr.send()
  } catch (err) {
    console.error('❌ Premium download error:', err)
    toast.error('Could not download file.')
    setDownloadProgress(null)
  }
}

  
  

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href,
      });
      
    } else {
      alert('Sharing is not supported on this device.');
    }
  };
  
  const attachedFiles =
  imageDetail?.attachedFiles?.map((file: any) => ({
    url: file.url,
    name: file.name,
  })) || [];

  const openPayModal = () => {
    // TODO: Replace with real payment gateway logic
    alert('This will open the PayPal / Razorpay payment modal.')
  }
  

  return (
    <>
    {downloadProgress !== null && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center">
    <div className="w-full max-w-md mx-auto px-6 py-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg text-center relative">
      <button
        onClick={() => setDownloadProgress(null)}
        className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 text-lg font-bold"
        aria-label="Close"
      >
        ×
      </button>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Downloading...</h3>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
        <div
          className="bg-blue-600 dark:bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${downloadProgress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{downloadProgress}% completed</p>
    </div>
  </div>
)}

    {imageDetail && (
    <StructuredData
      imageUrl={urlFor(imageDetail.image)}
      title={imageDetail.title}
      description={imageDetail.description}
      createdAt={imageDetail._createdAt}
      creatorName={imageDetail.creator?.username}
    />
  )}
  
    {isLoading ? ( // Use isLoading to conditionally render loading spinner
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 dark:border-blue-400"></div>
                </div>
            ) : (
              <>
  {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

  {imageDetail && (
    
  <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          
    {/* Responsive Google Ad *
        <div className="flex justify-center my-6">
          <Adu 
            adSlot="9995634858"
            adFormat="auto"
            style={{ display: 'block', width: '100%', maxWidth: '728px', height: 'auto' }} 
          />
        </div>
     Ad code finishes here */}
<br />
<div className="flex flex-col md:flex-row justify-center mt-8 gap-4">
  {/* Image column */}
  <div className="md:w-1/2 w-full lg:max-w-[300px]">
  <div className="shadow-lg rounded-lg overflow-hidden relative">
  {/* Main Image */}
  <Image
    src={urlFor(imageDetail.image).toString() || "/placeholder.svg"}
    alt={imageDetail.alt || imageDetail.title || 'Image'}
    width={800}
    height={1200}
    loading="lazy"
    className="w-full h-auto object-cover object-center rounded-xl"
    onContextMenu={(e) => e.preventDefault()} // ✅ Disable right-click
  />

</div>
  </div>
        {/* Text content column */}
        <div className='whitespace-pre-wrap max-w-[400px]'>
        
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{imageDetail.title}</h2>

                    {imageDetail.creator && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              by{' '}
              <Link
                href={`/${imageDetail.creator.username}`}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {imageDetail.creator.username}
              </Link>
            </div>
          )}

          <div className="flex items-center mt-4">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-gray-500 dark:text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={1.5}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
  <span className="text-sm font-medium">{imageDetail.views}</span>
</div>

          </div>
          <div className="mt-6 flex flex-wrap gap-6 items-center text-gray-700 dark:text-gray-300">
              {/* Like Button */}
              {session && imageDetail && (
                <LikeButton
                  imageId={imageDetail._id}
                  likes={imageDetail.likes}
                  likedBy={imageDetail.likedBy || []}
                  onLikeToggle={(liked, newLikes, userId) => {
                    setImageDetail((prev) =>
                      prev
                        ? {
                            ...prev,
                            likes: newLikes,
                            likedBy: liked
                              ? [...(prev.likedBy || []), { _ref: userId }]
                              : (prev.likedBy || []).filter((ref) => ref._ref !== userId),
                          }
                        : prev
                    )
                  }}
                />
              )}


              {/* Download Button */}
              {/* <button
                onClick={downloadImage}
                className="flex items-center gap-2 hover:text-green-600 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span className="font-medium">Download</span>
              </button> */}
              {/* Social Buttons */}
              <div className="flex items-center gap-2 ml-2">
                <FacebookShareButton url={currentUrl} title={imageDetail.title}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>
                <TwitterShareButton url={currentUrl} title={imageDetail.title}>
                  <XIcon size={32} round />
                </TwitterShareButton>
                <WhatsappShareButton url={currentUrl} title={imageDetail.title}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>
                <CopyToClipboard text={currentUrl} onCopy={() => setCopied(true)}>
                  <button
                    className={`text-xs px-3 py-2 rounded ${
                      copied 
                        ? 'bg-green-500 text-white dark:bg-green-600' 
                        : 'bg-gray-300 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </CopyToClipboard>
              </div>
            </div>

            {/* <PremiumInfoBlock
            isPremium={imageDetail.isPremium}
            downloadMode={imageDetail.downloadMode}
            price={imageDetail.price}
            unlockAfterPurchase={imageDetail.unlockAfterPurchase}
            isUnlocked={true} // TODO: replace with real check later
            attachedFiles={attachedFiles}
          /> */}

        {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}

        <DownloadSection
          isPaid={imageDetail.isPremium}
          isUnlocked={isUnlocked}
          price={imageDetail.price || 0}
          session={session ? { ...session, imageId: imageDetail._id } : null}
          onDownload={downloadImage}
          showLogin={() => setShowLoginModal(true)}
          isSubscriptionFree={isSubscriptionFree}
          creatorUsername={imageDetail.creator?.username}
        />
        <AdBlock adSlot="8397118667" className="my-6" />

            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">📄 Information</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line max-h-[280px] overflow-y-auto pr-2">
                {imageDetail.description}
              </p>

              <JoinTelegramMobile />

              {imageDetail.prompt && <PromptBlock prompt={imageDetail.prompt} />}

              <h3 className="text-lg font-semibold text-black dark:text-white mt-4">💬 Comments</h3>
            <CommentList imageId={imageDetail._id} />


                {imageDetail.tags && imageDetail.tags.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {imageDetail.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

    {/* Ad code finishes here */}
    <div className='mt-8'>
          <Link href='/images'>
            <span className="text-blue-600 dark:text-blue-400 hover:underline mt-8 text-lg font-medium px-4 py-2 border border-blue-600 dark:border-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200">Back</span>
          </Link>
          </div>
          {imageDetail.category && imageDetail.category._ref === "26e5736d-d55b-4472-bb81-9e44b58562f3" && (
        <div className="celebrity-concept-disclaimer break-words">
          <p className='whitespace-pre-wrap text-gray-700 dark:text-gray-300'> <br />
           <i> The image you are viewing is an AI-generated <br />conceptual piece featuring a <Link href="/n/disclaimer" className="text-blue-600 dark:text-blue-400 hover:underline"><strong> celebrity</strong> </Link> likeness <br />for creative and illustrative purposes.</i>
          </p>
        </div>
      )}
        </div>
        
      </div>
      </div>
      
  )}
  
        <div className='max-w-[70%] mx-auto'>
        <div className='flex justify-center items-center'>
        {/* {screenWidth < 768 ? <Banner3 /> : <Banner />} */}
        </div>  
          {/* Similar Images Section */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 mt-6">Similar Images</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mb-10">
              {similarImages.map((img) => (
                <div
                  key={img._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition overflow-hidden"
                >
                  <Link href={`/images/${img.slug.current}`}>
                  <div className="relative group">

                  <Image
                      src={urlFor(img.image).toString() || "/placeholder.svg"}
                      alt={img.alt || img.title || 'similar image'}
                      width={300}
                      height={500}
                      loading="lazy"
                      draggable={false}
                      className="rounded-md object-cover w-full h-auto transition-transform duration-200 hover:scale-105"
                      onContextMenu={(e) => e.preventDefault()} // ✅ THIS disables right-click
                    />
                    {/* ✅ Center Copyright Layer */}
  <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 pointer-events-none">
    <span className={`text-white text-2xl md:text-3xl lg:text-4xl font-bold opacity-30 select-none ${audiowide.className}`}>
      © Powerful
    </span>
  </div>

  {/* ✅ Logo Watermark */}
  <div className="absolute bottom-2 right-2 z-30 opacity-60">
    <Image
      src="/logo-watermark.png"
      alt="Watermark"
      width={40}
      height={40}
      className="pointer-events-none select-none"
    />
  </div>
                    {/* Invisible Trap Layer */}
  <div className="absolute inset-0 z-10 bg-transparent" />
</div>
                  </Link>
                </div>
              ))}
            </div>

        </div>
  
      </>
            )}
            </>
  )
};

export default ImageDetailComponent;
