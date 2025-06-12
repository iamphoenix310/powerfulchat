'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  image: string;
  guid: string;
}

export default function RssReviewPage() {
  const [items, setItems] = useState<RssItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/rss/fetch-raw');
      const data = await res.json();
      setItems(data.items || []);
      setLoading(false);
    })();
  }, []);

  const toggleSelect = (guid: string) => {
    setSelected((prev) => ({ ...prev, [guid]: !prev[guid] }));
  };

  const handlePublish = async () => {
    const toPublish = items.filter((item) => selected[item.guid]);
    if (!toPublish.length) {
      setStatus('❌ No stories selected.');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const res = await fetch('/api/rss/publish-selected', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: toPublish }),
    });

    const result = await res.json();
    if (res.ok) {
      setStatus(`✅ Published ${result.published.length} stories.`);
    } else {
      setStatus(`❌ ${result.error || 'Failed to publish.'}`);
    }

    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
      <h1 className="text-3xl font-bold text-center">📰 Review RSS Stories</h1>

      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
        </div>
      )}

      {!loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card
                key={item.guid}
                className={`relative ${selected[item.guid] ? 'ring ring-primary/50' : ''}`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <Checkbox
                      checked={selected[item.guid] || false}
                      onCheckedChange={() => toggleSelect(item.guid)}
                    />
                    <div className="text-sm text-muted-foreground">
                      {new Date(item.pubDate).toLocaleDateString()}
                    </div>
                  </div>
                  {item.image && (
                    <Image
                      src={item.image}
                      alt="thumbnail"
                      width={300}
                      height={180}
                      className="rounded-md object-cover w-full aspect-video"
                    />
                  )}
                  <h2 className="text-base font-semibold">{item.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline block"
                  >
                    View Original
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="pt-8 text-center space-y-4">
            <Button onClick={handlePublish} disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Selected'}
            </Button>
            {status && (
              <p
                className={`text-sm ${
                  status.startsWith('✅')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {status}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
