'use client';

import React, { useEffect, useState } from 'react';
import { client } from '@/app/utils/sanityClient';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
  userEmail: string;
}

const StatsGraph: React.FC<Props> = ({ userEmail }) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [likesData, setLikesData] = useState<number[]>([]);
  const [downloadsData, setDownloadsData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      const userQuery = `*[_type == "user" && email == $email][0]._id`;
      const userId = await client.fetch(userQuery, { email: userEmail });

      if (!userId) return;

      const [likes, downloads] = await Promise.all([
        client.fetch(`*[_type == "like" && image->creator._ref == $userId]{_createdAt}`, { userId }),
        client.fetch(`*[_type == "download" && image->creator._ref == $userId]{_createdAt}`, { userId }),
      ]);

      const monthCounts = (data: any[]) => {
        const counts: Record<string, number> = {};
        data.forEach((item) => {
          const month = dayjs(item._createdAt).format('MMM YYYY');
          counts[month] = (counts[month] || 0) + 1;
        });
        return counts;
      };

      const likeCounts = monthCounts(likes);
      const downloadCounts = monthCounts(downloads);
      const allMonths = Array.from(new Set([...Object.keys(likeCounts), ...Object.keys(downloadCounts)])).sort((a, b) =>
        dayjs(a, 'MMM YYYY').unix() - dayjs(b, 'MMM YYYY').unix()
      );

      setLabels(allMonths);
      setLikesData(allMonths.map(month => likeCounts[month] || 0));
      setDownloadsData(allMonths.map(month => downloadCounts[month] || 0));
      setLoading(false);
    };

    fetchStats();
  }, [userEmail]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Likes',
        data: likesData,
        backgroundColor: '#3B82F6',
      },
      {
        label: 'Downloads',
        data: downloadsData,
        backgroundColor: '#10B981',
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-semibold mb-4">📈 Engagement Growth</h2>
      {loading ? (
        <div className="text-center text-gray-400">Loading stats...</div>
      ) : (
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: false,
                text: 'Monthly Growth',
              },
            },
          }}
        />
      )}
    </div>
  );
};

export default StatsGraph;
