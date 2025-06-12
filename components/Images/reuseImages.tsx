'use client'
import React, { useEffect, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import '@/app/images/Images.module.css';
import { client, urlFor } from '@/app/utils/sanityClient';
import Link from 'next/link';
import Image from 'next/image';
import debounce from 'lodash.debounce';

interface Category {
    _id: string;
    name: string;
  }
  
  interface Image {
    _id: string;
    title: string;
    slug: { current: string };
    image: any; // Adjust this to your image object structure
    likes: number;
  }

const Images = () => {
    const [images, setImages] = useState<Image[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchInput, setSearchInput] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [screenWidth, setScreenWidth] = useState(0);
    const [page, setPage] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const pageSize = 16;

    // Fetch categories from the database
    useEffect(() => {
        const fetchCategories = `*[_type == "category"]`;
        client.fetch(fetchCategories)
            .then((data) => {
                setCategories(data);
            })
            .catch((err) => console.error(err));
    }, []);

    // Fetch images with search and category filtering
    useEffect(() => {
        const categoryFilter = selectedCategory ? `&& category._ref == '${selectedCategory._id}'` : '';
        const searchFilter = searchTerm ? `&& (tags match '${searchTerm}' || title match '${searchTerm}' || description match '${searchTerm}')` : '';
        const fetchQuery = `*[_type == "images" ${categoryFilter} ${searchFilter}] | order(_updatedAt desc) [${page * pageSize}...${(page + 1) * pageSize}]`;
    
        client.fetch(fetchQuery)
            .then((data) => {
                if (page === 0) {
                    setImages(data);
                } else {
                    // Filtering out duplicates based on _id
                    const newData = data.filter((newImage: { _id: string; }) => !images.some(existingImage => existingImage._id === newImage._id));
                    setImages([...images, ...newData]);
                }
                setIsLoading(false);
            })
            .catch((err) => console.error(err));
            setIsLoading(false);
    }, [page, selectedCategory, searchTerm]);
    

    const handleCategoryClick = (category : any) => {
        setSelectedCategory(category);
        setPage(0);
    };

    const handleSearch = (e : any) => {
        e.preventDefault();
        setSearchTerm(searchInput);
        setPage(0);
    };

    useEffect(() => {
        const handleScroll = debounce(() => {
            if (window.innerHeight + document.documentElement.scrollTop < document.documentElement.offsetHeight - 100) return;
            setPage(prevPage => prevPage + 1);
        }, 100);

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            handleScroll.cancel();
        };
    }, []);

    useEffect(() => {
        // Function to handle window resize events
        const handleResize = () => {
          setScreenWidth(window.innerWidth);
        };
      
        // Check if window is defined (i.e., if we are in the browser)
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', handleResize);
      
          // Set initial screen width
          handleResize();
      
          // Clean up the event listener when the component unmounts
          return () => window.removeEventListener('resize', handleResize);
        }
      }, []);
      

    return (
        <>
        {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
    <div className="max-w-[80%] mx-auto">
    <div className='flex justify-center items-center'>
        <h2 className='mt-5 mb-5 text-2xl'>Explore Beautiful Images</h2>
    </div>

            
    <div className="search-bar mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input 
                type="text" 
                className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                placeholder="Try Searching white saree etc..." 
                onChange={(e) => setSearchInput(e.target.value)}
                value={searchInput}
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                <FiSearch />
            </button>
        </form>
    </div>
    <div className='flex justify-center items-center'>
    </div>   
    <div className="category-buttons flex flex-wrap gap-3 mb-4">
    <button 
        onClick={() => handleCategoryClick(null)}
        className={`p-2 border border-gray-300 rounded-md text-sm ${selectedCategory == null ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
    >
        All
    </button>
    {categories.map((category) => (
        <button 
            key={category._id} 
            onClick={() => handleCategoryClick(category)}
            className={`p-2 border border-gray-300 rounded-md text-sm ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-white hover:bg-blue-100'}`}
        >
            {category.name}
        </button>
    ))}
</div>

    <div className="max-w-full mx-auto">
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {images.map((image) => (
            <div key={image._id} className="mb-4">
                <div className="overflow-hidden shadow-lg rounded-lg cursor-pointer m-auto transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-2xl">
                    <Link href={`/images/${image.slug.current}`}>
                        <span className="w-full block">
                        <Image
                            alt={image.title}
                            src={urlFor(image.image, { width: 500, height: 889 })}
                            width={500}
                            height={889}
                            loading="lazy"
                            className="w-full h-auto object-cover object-center rounded-lg"
                            />
                        </span>
                    </Link>
                    <div className="bg-white dark:bg-gray-800 w-full p-4">
                        <p className="text-indigo-500 text-md font-medium">
                            Likes: {image.likes || 0}
                        </p>
                        <p className="text-gray-800 dark:text-white text-xl font-medium mb-2">
                            {image.title}
                        </p>
                    </div>
                </div>
            </div>
        ))}
        </div>
    </div>
</div>
      )}

        </>
    );
};

export default Images;
