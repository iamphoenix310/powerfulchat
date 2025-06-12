"use client";

import { useState, useEffect } from "react";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  EmailIcon,
} from "react-share";
import { CopyToClipboard } from "react-copy-to-clipboard";

interface ShareButtonsProps {
  shareUrl: string; // ✅ Add this prop type
  title: string;
}

const SocialShare = ({ shareUrl, title }: ShareButtonsProps) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-8">
      <div className="flex justify-center space-x-4">
        <FacebookShareButton url={shareUrl} title={title}>
          <FacebookIcon size={40} round />
        </FacebookShareButton>
        <TwitterShareButton url={shareUrl} title={title}>
          <TwitterIcon size={40} round />
        </TwitterShareButton>
        <WhatsappShareButton url={shareUrl} title={title}>
          <WhatsappIcon size={40} round />
        </WhatsappShareButton>
        <EmailShareButton url={shareUrl} subject={title}>
          <EmailIcon size={40} round />
        </EmailShareButton>
        <CopyToClipboard text={shareUrl} onCopy={() => setCopied(true)}>
          <button
            className={`ml-4 p-2 rounded text-xs ${
              copied ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
};

export default SocialShare;