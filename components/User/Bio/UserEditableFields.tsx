'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

interface Props {
  currentUserId: string;
  user: {
    _id: string;
    bio?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      linkedin?: string;
      website?: string;
    };
  };
  onSuccess?: () => void;
}

export default function UserEditableFields({ currentUserId, user, onSuccess }: Props) {
  const { data: session } = useSession();

  const [bio, setBio] = useState(user.bio || '');
  const [socialLinks, setSocialLinks] = useState(user.socialLinks || {});
  const [saving, setSaving] = useState(false);

  if (currentUserId !== user._id) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, socialLinks }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error('[Update error]', result?.error);
        throw new Error(result?.error || 'Update failed');
      }

      toast.success('Profile updated!');
      onSuccess?.(); // close editor
    } catch (err) {
      console.error(err);
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="mt-6 space-y-4 text-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="bio">Short Bio</Label>
        <Input
          id="bio"
          maxLength={40}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short 40-char bio"
          className="py-1.5 text-base"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(['twitter', 'instagram', 'linkedin', 'website'] as const).map((platform) => (
          <div key={platform} className="space-y-1">
            <Label htmlFor={platform}>
              {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
            </Label>
            <Input
              id={platform}
              type="url"
              value={socialLinks?.[platform] || ''}
              onChange={(e) =>
                setSocialLinks((prev) => ({
                  ...prev,
                  [platform]: e.target.value,
                }))
              }
              placeholder={`https://${platform}.com/your-handle`}
              className="py-1.5 text-base"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSuccess?.()} // close the editor
          className="px-4 py-1.5 text-sm"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="px-5 py-1.5 text-sm bg-black hover:bg-gray-900 text-white"
        >
          {saving ? 'Saving...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
}
