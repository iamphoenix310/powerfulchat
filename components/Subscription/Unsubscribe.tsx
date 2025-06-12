'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';

export default function UnsubscribePage() {
  const [email, setEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.error || 'Unsubscribe failed');
      }

      setConfirmed(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Unsubscribe from Emails</h1>

      {confirmed ? (
        <>
          <p className="text-green-600 mb-6">You have been unsubscribed. We are sad to see you go!</p>
          <Link
            href="/"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-900 transition"
          >
            Return to Homepage
          </Link>
        </>
      ) : (
        <>
          <p className="text-gray-700 mb-6">
            Do not want to receive emails from us anymore? Enter your email below to unsubscribe.
          </p>

          <div className="text-left space-y-4 max-w-md mx-auto">
            <Label htmlFor="email" className="block text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full"
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleUnsubscribe}
              disabled={!email || loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Unsubscribing...' : 'Unsubscribe Me'}
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Changed your mind or need help? <br />
            <Link href="/n/contact" className="underline text-blue-600">Contact support</Link>
          </p>
        </>
      )}
    </div>
  );
}
