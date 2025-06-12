import React from "react";
import SubscriptionPage from "@/components/Subscription/Subscription";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Subscription",
  description: "Choose your power plan to unlock AI image generation.",
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 px-6">
      <SubscriptionPage />
    </div>
  );
}

