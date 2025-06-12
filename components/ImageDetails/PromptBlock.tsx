'use client';

import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

interface PromptBlockProps {
  prompt: string;
}

const PromptBlock: React.FC<PromptBlockProps> = ({ prompt }) => {
  const [copied, setCopied] = useState(false);

  return (
    <div className="mt-10 bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-gray-800 dark:via-indigo-900 dark:to-gray-800 text-white rounded-xl p-6 shadow-lg transition-all">
      <h3 className="text-lg font-bold mb-3 tracking-wide uppercase text-indigo-200">AI Prompt</h3>
      <p className="text-sm leading-relaxed mb-4 break-words">{prompt}</p>
      <CopyToClipboard
        text={prompt}
        onCopy={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        <button
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            copied ? 'bg-green-500 dark:bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
          } transition-colors`}
        >
          {copied ? 'Copied!' : 'Copy Prompt'}
        </button>
      </CopyToClipboard>
    </div>
  );
};

export default PromptBlock;
