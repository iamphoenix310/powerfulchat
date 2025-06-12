'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { urlFor } from '@/app/utils/sanityClient';
import { updateUser } from '@/app/lib/api'; // adjust path

interface Props {
  user: {
    _id: string;
    username: string;
    email: string;
    image?: { asset: { _ref: string } };
    karmaPoints?: number;
  };
}

const DashboardHeader: React.FC<{ user: Props['user'] }> = ({ user }) => {
  const [username, setUsername] = useState(user.username);
  const [editing, setEditing] = useState(false);

  const handleSave = async () => {
    await updateUser({ _id: user._id, username });
    setEditing(false);
  };

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

export default DashboardHeader;
