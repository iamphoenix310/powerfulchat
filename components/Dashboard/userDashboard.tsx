'use client';

import React, { useEffect, useState } from 'react';
import { updateUser, fetchUserData } from '@/app/lib/api';
import Image from 'next/image';
import { urlFor } from '@/app/utils/sanityClient';

interface Props {
  userEmail: string;
}

const UserOverview: React.FC<Props> = ({ userEmail }) => {
  const [user, setUser] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserData(userEmail);
      if (data) {
        setUser(data);
        setUsername(data.username || '');
      }
    };
    loadUser();
  }, [userEmail]);

  const handleSave = async () => {
    if (!user?._id) return;
    const response = await updateUser({ ...user, username });
    if (response.success && response.updatedUser) {
      setUser(response.updatedUser);
      setEditing(false);
    }
  };

  if (!user) {
    return <div className="text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="flex justify-between items-center mb-6 border-b pb-4">
      <div className="flex items-center gap-4">
        {user.image?.asset && (
          <Image
            src={urlFor(user.image)}
            alt={user.username}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
        )}
        <div>
          {editing ? (
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="text-lg font-semibold border px-2 py-1 rounded"
            />
          ) : (
            <h2 className="text-xl font-bold">{user.username}</h2>
          )}
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm">Karma Points: {user.karmaPoints ?? 0}</p>
        {editing ? (
          <button onClick={handleSave} className="text-blue-600 text-sm mt-1">Save</button>
        ) : (
          <button onClick={() => setEditing(true)} className="text-blue-600 text-sm mt-1">Edit</button>
        )}
      </div>
    </div>
  );
};

export default UserOverview;
