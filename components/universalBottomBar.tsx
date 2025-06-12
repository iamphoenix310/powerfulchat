"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Define each bottom bar item structure
export interface BottomBarItem {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
}

// Define the props for the entire BottomBar
interface UniversalBottomBarProps {
  items: BottomBarItem[];
}

const UniversalBottomBar: React.FC<UniversalBottomBarProps> = ({ items }) => {
  const pathname = usePathname() ?? "";
  if (!items || items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white shadow-md py-2 flex justify-around items-center md:hidden border-t border-gray-300 z-50 px-4">
      {items.map((item, i) => (
        <BottomItem key={i} item={item} pathname={pathname} />
      ))}
    </div>
  );
};

const BottomItem = ({ item, pathname }: { item: BottomBarItem; pathname: string }) => {
  const isActive = item.href && pathname === item.href;

  const baseClasses =
    "flex flex-col items-center justify-center p-1 transition-all duration-200";
  const iconColor = isActive ? "text-blue-600" : "text-gray-600";
  const labelColor = isActive
    ? "text-blue-600 font-medium"
    : "text-gray-600";

  const buttonWrapper = baseClasses;

  if (item.href) {
    return (
      <Link href={item.href} className={buttonWrapper}>
        <span className={`w-6 h-6 ${iconColor}`}>{item.icon}</span>
        <span className={`text-xs mt-1 ${labelColor}`}>{item.label}</span>
      </Link>
    );
  }

  return (
    <button onClick={item.onClick} className={buttonWrapper}>
      <span className={`w-6 h-6 ${iconColor}`}>{item.icon}</span>
      <span className={`text-xs mt-1 ${labelColor}`}>{item.label}</span>
    </button>
  );
};


export default UniversalBottomBar;
