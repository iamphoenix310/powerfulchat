"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import UniversalBottomBar, { BottomBarItem } from '@/components/universalBottomBar';

interface BottomBarWrapperProps {
  items: BottomBarItem[];
}

export default function BottomBarWrapper({ items }: BottomBarWrapperProps) {
  const pathname = usePathname() || "";
  
  // Do not show the universal bottom bar on image detail pages
  if (pathname.startsWith('/images/')) return null;

  return <UniversalBottomBar items={items} />;
}
