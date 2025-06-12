'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function AddNewsPage() {
  const [category, setCategory] = useState('');
  const [sourceInfo, setSourceInfo] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const generateArticle = async () => {
    setLoading(true);
    const res = await fetch('/api/articles/generate-article', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categorySlug: category,
        sourceInfo,
        metaDescription
      })
    });

    const data = await res.json();
    if (data?.slug) alert(`✅ News live at /news/${data.slug}`);
    else alert(data?.error || 'Something went wrong.');
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">AI News Generator</h1>

      <input
        placeholder="Sanity Category ID (_id)"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <textarea
        rows={4}
        placeholder="Paste your news source or context here..."
        value={sourceInfo}
        onChange={(e) => setSourceInfo(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <textarea
        rows={2}
        placeholder="Meta description for SEO"
        value={metaDescription}
        onChange={(e) => setMetaDescription(e.target.value)}
        className="w-full border p-2 rounded"
      />

      <Button onClick={generateArticle} disabled={loading}>
        {loading ? 'Generating...' : 'Generate & Publish'}
      </Button>
    </div>
  );
}
