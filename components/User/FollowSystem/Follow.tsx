'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/GoogleLogin/LoginModel';

type Props = {
  targetUserId: string;
  isFollowing: boolean;
};

export default function FollowButton({ targetUserId, isFollowing }: Props) {
  const { data: session } = useSession();
  const [following, setFollowing] = useState(isFollowing);
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleToggle = async () => {
    if (!session?.user?.id) {
      setShowLoginModal(true);
      return;
    }

    setLoading(true);
    const action = following ? 'unfollow' : 'follow';

    await fetch('/api/user/follow', {
      method: 'POST',
      body: JSON.stringify({
        currentUserId: session.user.id,
        targetUserId,
        action,
      }),
    });

    setFollowing(!following);
    setLoading(false);
  };

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-1.5 text-sm rounded-md font-medium transition-all duration-200 shadow-sm border 
            ${
            loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : following
                ? 'bg-white text-red-500 border-red-500 hover:bg-red-100'
                : 'bg-black text-white border-black hover:bg-gray-900'
            }`}
        >
        {loading ? '...' : following ? 'Unfollow' : 'Follow'}
        </button>
    </>
  );
}
