// components/ConsentBanner.js

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const ConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('gdpr-consent');
        if (consent !== 'accepted') {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('gdpr-consent', 'accepted');
        setIsVisible(false);
        setShowOverlay(false);
    };

    const handleReject = () => {
        localStorage.clear();
        setShowOverlay(true);
    };

    if (!isVisible && !showOverlay) return null;

    return (
        <>
            {showOverlay && (
                <div className="fixed top-0 left-0 right-0 bottom-0 bg-black text-white flex flex-col items-center justify-center z-50 p-4">
                    <p className="mb-4">You must accept cookies in order to use our website.</p>
                    <button 
                        className="bg-white text-blue-500 py-2 px-4 rounded" 
                        onClick={handleAccept}
                    >
                        Accept
                    </button>
                </div>
            )}
            {isVisible && (
                <div className="fixed bottom-0 left-0 right-0 bg-gray-500 text-white p-4 flex justify-between items-center z-40">
                    <p className="flex-grow">
                        We use cookies for better user experience. By using our site, you consent to our 
                        <Link href="/n/privacy" className="text-black font-bold">
                            &nbsp;cookie policy.
                        </Link>
                    </p>
                    <div>
                        <button 
                            className="bg-white text-blue-500 p-2 rounded mr-2" 
                            onClick={handleAccept}
                        >
                            Accept
                        </button>
                        <button 
                            className="bg-white text-red-500 p-2 rounded" 
                            onClick={handleReject}
                        >
                            Do Not Accept
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default ConsentBanner;
