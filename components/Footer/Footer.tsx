'use client';

import Link from 'next/link';
import { Instagram, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';


const Footer = () => {
  return (
    <footer className="relative z-10 bg-black text-gray-400 px-6 pt-10 pb-10 sm:pb-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center space-y-6">

        {/* Branding */}
        <div className="text-center space-y-2">
          <p className="text-white text-lg font-semibold">Powerful</p>
          <p className="text-sm text-gray-500">© 2023 - 2025 Powerful Creations. All rights reserved.</p>
        </div>

        {/* Links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-sm text-center">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/n/about" className="hover:text-white transition">About Us</Link>
          <Link href="/n/privacy" className="hover:text-white transition">Privacy Policy</Link>
          <Link href="/n/disclaimer" className="hover:text-white transition">Disclaimer</Link>
          <Link href="/n/contact" className="hover:text-white transition">Contact Us</Link>
          <Link href="/n/terms" className="hover:text-white transition">Terms</Link>
          <Link href="/n/cancel" className="hover:text-white transition">Cancellation</Link>
          <Link href="/n/refund" className="hover:text-white transition">Refund</Link>
        </div>

        {/* Social Icons */}
        <div className="flex gap-6 mt-6">
          <Link href="https://x.com/powerfulcreat" target="_blank" className="hover:text-white transition">
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
              <FontAwesomeIcon icon={faXTwitter} size="lg" />
            </motion.div>
          </Link>
          <Link href="https://instagram.com/powerfulcrea" target="_blank" className="hover:text-white transition">
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
              <Instagram size={24} />
            </motion.div>
          </Link>
          <Link href="https://t.me/powerfulcrea" target="_blank" className="hover:text-white transition">
            <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
              <Send size={24} />
            </motion.div>
          </Link>
        </div>

      </div>

      {/* Safe area padding */}
      <div className="h-[env(safe-area-inset-bottom)] w-full" />
    </footer>
  );
};

export default Footer;
