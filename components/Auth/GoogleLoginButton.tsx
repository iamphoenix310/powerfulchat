'use client';

import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc'; // using react-icons for Google logo

export default function GoogleLoginButton() {
  return (
    <button
      onClick={() => signIn('google')}
      className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 font-semibold py-2 px-4 rounded-md transition-all duration-200 shadow-sm"
    >
      <FcGoogle size={24} />
      <span>Continue with Google</span>
    </button>
  );
}
