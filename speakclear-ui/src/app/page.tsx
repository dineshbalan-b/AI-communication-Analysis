"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Hero from '@/components/Landing/Hero';
import Features from '@/components/Landing/Features';
import CTA from '@/components/Landing/CTA';
import Footer from '@/components/Landing/Footer';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    router.prefetch("/login");
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-[#111822] text-slate-100 overflow-x-hidden selection:bg-[#13a4ec]/30 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-[#212E3B] bg-[#111822]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="bg-[#13a4ec] p-2 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(19,164,236,0.5)]">
              <span className="material-symbols-outlined text-white text-2xl">graphic_eq</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">SpeakClear</h2>
          </motion.div>

          <nav className="hidden md:flex items-center gap-10">
            {['Features', 'Pricing', 'About'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`#${item.toLowerCase()}`} className="text-sm font-medium hover:text-[#13a4ec] transition-colors relative group">
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#13a4ec] transition-all group-hover:w-full"></span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/login" className="hidden sm:block text-sm font-semibold px-4 py-2 hover:text-[#13a4ec] transition">Log In</Link>
            <Link href="/login" className="bg-[#13a4ec] hover:bg-[#108CCC] text-white px-6 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg shadow-[#13a4ec]/20 hover:-translate-y-0.5 hover:shadow-[#13a4ec]/40">
              Get Started
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
