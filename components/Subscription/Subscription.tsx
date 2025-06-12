'use client';

import { newsClient } from '@/app/utils/sanityClient';
import SubscriptionFeatures from '@/components/Subscription/Features';
import SubscriptionHero from '@/components/Subscription/Hero';
import RazorpayCheckout from '@/components/Subscription/Payments/RazorpayCheckout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Audiowide } from 'next/font/google';
import { useEffect, useState } from 'react';

const audiowide = Audiowide({ weight: '400', subsets: ['latin'] });

const allPlans = [
  { name: 'Free Trial', price: 0, credits: 5, bestFor: 'Try Free – 5 Images', recommended: false },
  { name: 'Starter', price: 299, credits: 150, bestFor: 'Perfect for Trying Out', recommended: false },
  { name: 'Popular', price: 999, credits: 550, bestFor: 'Best for Frequent Creators', recommended: true },
  { name: 'Pro', price: 1999, credits: 1300, bestFor: 'Great for Pros & Designers', recommended: false },
  { name: 'Ultimate', price: 3999, credits: 3400, bestFor: 'Studios & Power Creators', recommended: false },
];

function getPerImageCost(price: number, credits: number): string {
  if (credits === 0) return 'Free';
  return `₹${(price / credits).toFixed(2)} / image`;
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const [subscriptionActive, setSubscriptionActive] = useState(false);
  const [freeTrialActive, setFreeTrialActive] = useState(false);
  const [freeTrialClaimed, setFreeTrialClaimed] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [hasSubscribedBefore, setHasSubscribedBefore] = useState(false);
  const [images, setImages] = useState<any[]>([]);
  const [expiryReason, setExpiryReason] = useState<'none' | 'credits' | 'time'>('none');

  const plans = hasSubscribedBefore ? allPlans.slice(1) : allPlans;

  useEffect(() => {
    const fetchUserSubscription = async () => {
      if (status !== 'authenticated' || !session?.user?.email) return;
      try {
        const userData = await newsClient.fetch(
          `*[_type == "user" && email == $email][0]{
            _id, subscriptionActive, subscriptionCredits, subscriptionStartDate,
            freeTrialActive, freeTrialClaimed
          }`,
          { email: session.user.email }
        );

        setCredits(userData?.subscriptionCredits || 0);
        setSubscriptionActive(userData?.subscriptionActive || false);
        setFreeTrialClaimed(userData?.freeTrialClaimed || false);
        setFreeTrialActive(userData?.freeTrialActive || false);
        setHasSubscribedBefore(!!userData?.subscriptionStartDate);
      } catch (err) {
        console.error('💥 Error loading user data:', err);
      }
    };

    fetchUserSubscription();
  }, [session, status]);

  useEffect(() => {
    const checkSubscriptionExpiry = async () => {
      if (status !== 'authenticated' || !session?.user?.email) return;

      try {
        const userData = await newsClient.fetch(
          `*[_type == "user" && email == $email][0]{ _id, subscriptionCredits, subscriptionStartDate, subscriptionActive }`,
          { email: session.user.email }
        );

        if (userData?.subscriptionActive) {
          const now = new Date();
          const start = new Date(userData.subscriptionStartDate);
          const days = (now.getTime() - start.getTime()) / (1000 * 3600 * 24);

          if (userData.subscriptionCredits <= 0 || days >= 30) {
            await newsClient.patch(userData._id).set({ subscriptionActive: false }).commit();
            setSubscriptionActive(false);
            setCredits(0);
            setExpiryReason(userData.subscriptionCredits <= 0 ? 'credits' : 'time');
          }
        }
      } catch (err) {
        console.error('💥 Error checking expiry:', err);
      }
    };

    checkSubscriptionExpiry();
  }, [session, status]);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white py-12 px-6">
      {/* 🎨 Hero Section */}
      <div className="text-center space-y-4 pb-12">
        <SubscriptionHero />
      </div>

      

      {/* ✅ Status Banner */}
      {(freeTrialActive || subscriptionActive) && (
        <div className={`max-w-7xl mx-auto mb-10 p-6 rounded-2xl text-center ${freeTrialActive ? 'bg-blue-800' : 'bg-green-800'}`}>
          <h2 className="text-2xl font-bold mb-2">
            {freeTrialActive ? '🎁 Trial Active' : '🎯 Subscription Active'}
          </h2>
          <p className={freeTrialActive ? 'text-blue-100' : 'text-green-100'}>
            {freeTrialActive ? (
              <>You are using the free trial. <br /> Credits Left: <span className="font-bold">{credits}</span></>
            ) : (
              <>You have an active subscription. <br /> Credits Left: <span className="font-bold">{credits}</span></>
            )}
          </p>
        </div>
      )}

      {/* ❌ Expired Banner */}
      {!subscriptionActive && hasSubscribedBefore && !freeTrialActive && (
        <div className="max-w-7xl mx-auto mb-10 p-6 rounded-2xl bg-red-800 text-center">
          <h2 className="text-2xl font-bold mb-2">🚫 Subscription Expired</h2>
          <p className="text-red-100">
            {expiryReason === 'credits'
              ? 'Your credits are finished. Please subscribe again!'
              : 'Your subscription expired. Please renew to continue!'}
          </p>
        </div>
      )}

      {/* 🛒 Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto my-12">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <Card className="bg-[#121212] border border-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all">
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow">
                  Recommended
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                <p className="text-sm text-gray-400">{plan.bestFor}</p>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="text-white text-4xl font-extrabold mb-1">₹{plan.price}</div>
                <div className="text-gray-400 text-xs mb-4">{getPerImageCost(plan.price, plan.credits)}</div>
                <ul className="text-left text-gray-300 text-sm space-y-2 mb-6">
                  <li>🚀 {plan.credits} Generations</li>
                  <li>🎨 Private Creation</li>
                  <li>🎯 No Expiry</li>
                  <li>✨ Free Premium Content</li>
                </ul>
                {status === 'authenticated' ? (
                  plan.price === 0 ? (
                    freeTrialClaimed ? (
                      <div className="text-sm text-red-400 font-semibold">
                        ✅ Free Trial Already Claimed
                      </div>
                    ) : (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/claim-free-trial', { method: 'POST' });
                          const json = await res.json();
                          if (json.success) window.location.reload();
                          else alert(json.message || 'Failed to claim.');
                        }}
                        className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full text-xs shadow"
                      >
                        🎁 Claim Free Trial
                      </button>
                    )
                  ) : (
                    <RazorpayCheckout
                      planName={plan.name}
                      amount={plan.price}
                      credits={plan.credits}
                    />
                  )
                ) : (
                  <a
                    href="/auth?mode=signup&redirect=/subscription"
                    className="w-full inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full text-xs shadow text-center"
                  >
                    Login or Sign Up
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      
      <SubscriptionFeatures />
    </div>
    </>
  );
}
