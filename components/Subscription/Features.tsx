'use client'

import { motion } from 'framer-motion'
import { CameraIcon, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'Powerful Prompt Generator',
    description: 'Craft stunning prompts with ease to inspire next-level AI generations.',
  },
  {
    icon: CameraIcon,
    title: 'Hyper-Realistic Images',
    description: 'Generate breathtaking, cinematic, ultra-detailed artworks effortlessly.',
  },
  {
    icon: ShieldCheck,
    title: 'No Expiry Credits',
    description: 'Credits never expire. Use them whenever you need, at your own pace.',
  },
 
]

export default function SubscriptionFeatures() {
  return (
    <section className="bg-[#0c0c0c] py-20 px-6">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Why Subscribe?</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Get exclusive benefits designed for creators, artists, and dreamers who want the best AI tools at their fingertips.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-[#121212] p-8 rounded-2xl border border-gray-800 hover:border-blue-600 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 mx-auto">
              <feature.icon className="text-white w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
