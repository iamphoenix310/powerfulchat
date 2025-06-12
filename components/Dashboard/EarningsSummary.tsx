'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/app/utils/sanityClient';

interface Props {
  userEmail: string;
}

const EarningsSummary: React.FC<Props> = ({ userEmail }) => {
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null);

  useEffect(() => {
    const fetchEarnings = async () => {
      // Step 1: Get userId
      const user = await client.fetch(`*[_type == "user" && email == $email][0]{ _id }`, {
        email: userEmail,
      });

      if (!user?._id) return;

      // Step 2: Get images uploaded by this user
      const userImages = await client.fetch(
        `*[_type == "images" && creator._ref == $uid]{ _id, views }`,
        { uid: user._id }
      );

      // Step 3: Mock earning logic (e.g., $0.01 per view)
      const totalViews = userImages.reduce((sum: number, img: any) => sum + (img.views || 0), 0);
      const earnings = totalViews * 0.01;

      setTotalEarnings(earnings);
    };

    fetchEarnings();
  }, [userEmail]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-md shadow p-6">
      <h3 className="text-lg font-semibold mb-2 text-blue-800">💰 Earnings Summary</h3>

      {totalEarnings === null ? (
        <p className="text-gray-500 text-sm">Calculating earnings...</p>
      ) : (
        <div className="text-3xl font-bold text-blue-700">
          ${totalEarnings.toFixed(2)}
          <span className="text-sm text-gray-600 font-normal ml-2">USD</span>
        </div>
      )}

      <p className="text-xs text-gray-500 mt-2">
        Based on ad revenue from your image views (mock: $0.01/view)
      </p>
    </div>
  );
};

export default EarningsSummary;
