'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  isNewUser?: boolean;
  [key: string]: any; // Allow other properties
}

interface Session {
  user?: User;
}

export default function CheckNewUser() {
  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (session?.user?.isNewUser === true) {
      // Important: Prevent infinite redirect loop if already on /onboarding
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
    }
  }, [session, router, pathname]);

  return null;
}
