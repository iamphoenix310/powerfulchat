"use client";

import { useEffect, useRef } from "react";

const Adu = ({ adSlot, adFormat = "auto", style }) => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    const loadAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error("Adsbygoogle push error:", err);
      }
    };

    const existingScript = document.querySelector("script[src*='adsbygoogle.js']");
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.onload = loadAd;
      document.body.appendChild(script);
    } else {
      loadAd();
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{
        display: "block",
        width: "100%",
        maxWidth: "728px",
        minHeight: "90px", // ✅ Prevent blue loader dots
        backgroundColor: "#f3f3f3", // subtle fallback for better UX
        ...style,
      }}
      data-ad-client="ca-pub-4196999734826664"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
    />
  );
};

export default Adu;
