'use client';

import React, { useEffect, useState } from 'react';
import { client, urlFor } from '@/app/utils/sanityClient';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  _id: string;
  type: 'like' | 'download';
  image: {
    _id: string;
    title: string;
    slug: { current: string };
    image: any;
  };
  user: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

const RecentActivity: React.FC<{ userEmail: string }> = ({ userEmail }) => {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);

      // Get creator ID
      const creator = await client.fetch(`*[_type == "user" && email == $email][0]{ _id }`, {
        email: userEmail,
      });

      if (!creator?._id) return;

      // Fetch recent likes/downloads on their images
      const query = `
        *[
          (_type == "like" || _type == "download") &&
          image->creator._ref == $creatorId
        ] | order(_createdAt desc)[0...10] {
          _id,
          _type,
          createdAt,
          "type": _type,
          "user": user->{
            _id,
            username
          },
          "image": image->{
            _id,
            title,
            slug,
            image
          }
        }
      `;

      const data = await client.fetch(query, { creatorId: creator._id });
      setActivity(data);
      setLoading(false);
    };

    fetchActivity();
  }, [userEmail]);

  if (loading) {
    return <p className="text-gray-500">Loading recent activity...</p>;
  }

  if (activity.length === 0) {
    return <p className="text-gray-500">No recent likes or downloads yet.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
      <ul className="space-y-4">
        {activity.map((item) => (
          <li key={item._id} className="bg-white shadow rounded p-4 flex items-center gap-4">
            <Image
              src={urlFor(item.image.image)}
              alt={item.image.title}
              width={80}
              height={60}
              className="rounded object-cover"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-800">
                <Link href={`/${item.user.username}`} className="text-blue-600 font-medium hover:underline">
                  {item.user.username}
                </Link>{' '}
                {item.type === 'like' ? 'liked' : 'downloaded'} your image{' '}
                <Link href={`/images/${item.image.slug.current}`} className="text-blue-600 hover:underline">
                  {item.image.title}
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;
