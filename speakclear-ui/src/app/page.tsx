"use client";

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch with motion

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } as any }
  };

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
        {/* Hero Section */}
        <section className="relative pt-20 pb-24 px-6 flex justify-center overflow-hidden">
          {/* Dynamic background blobs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#13a4ec] rounded-full blur-[120px] -z-10 mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.05, 0.15, 0.05],
            }}
            transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#0b5f8a] rounded-full blur-[120px] -z-10 mix-blend-screen"
          />

          <div className="max-w-[1200px] w-full grid lg:grid-cols-[1fr_500px] gap-16 items-center z-10">

            {/* Left Column (Text & CTA) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-8 w-full"
            >
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#13a4ec]/30 bg-[#13a4ec]/10 w-fit backdrop-blur-sm">
                <span className="material-symbols-outlined text-[#13a4ec] text-[15px] animate-pulse">auto_awesome</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#13a4ec]">New AI Analysis V2.0</span>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-6">
                <h1 className="text-6xl sm:text-7xl font-black leading-[1.05] tracking-tight text-white">
                  Master Your<br />
                  Verbal Clarity<br />
                  with <span className="text-[#13a4ec] drop-shadow-[0_0_15px_rgba(19,164,236,0.3)]">AI<br />Analysis</span>
                </h1>
                <p className="text-lg text-slate-400 max-w-lg leading-relaxed font-medium">
                  SpeakClear identifies thinking gaps, tracks filler words, and refines your professional tone using advanced voice-based intelligence.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-2">
                <Link href="/login" className="bg-[#13a4ec] hover:bg-[#108CCC] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 group shadow-[0_10px_30px_rgba(19,164,236,0.3)] hover:shadow-[0_15px_40px_rgba(19,164,236,0.5)] hover:-translate-y-1">
                  Start Analyzing Now
                  <span className="material-symbols-outlined group-hover:translate-x-1.5 transition-transform duration-300">arrow_forward</span>
                </Link>
                <button className="border border-[#2D3F51] bg-[#1B2531]/80 backdrop-blur-sm hover:bg-[#253241] px-8 py-4 rounded-xl text-lg font-bold transition-all text-white hover:-translate-y-1 hover:shadow-lg">
                  View Demo
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center gap-4 mt-6 text-sm text-slate-400 font-medium">
                {/* Avatar Pile Mockup */}
                <div className="flex -space-x-3">
                  {['👩‍💼', '👨‍💼', '👨‍💻'].map((emoji, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (i * 0.1) }}
                      className="w-10 h-10 rounded-full border-2 border-[#111822] bg-[#1B2531] overflow-hidden flex items-center justify-center pl-1 hover:-translate-y-1 cursor-pointer transition-transform relative z-[3] hover:z-10"
                    >
                      <span className="text-xl">{emoji}</span>
                    </motion.div>
                  ))}
                </div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Trusted by <strong className="text-white">5,000+</strong> professionals worldwide
                </motion.p>
              </motion.div>
            </motion.div>

            {/* Right Column (Visual) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="relative w-full h-full flex justify-end perspective-1000"
            >
              <div className="relative w-full max-w-[500px] rounded-2xl overflow-hidden border border-[#212E3B] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] bg-[#1D2531]/90 backdrop-blur-xl group z-10 flex flex-col pt-6 pb-6 mt-8 lg:mt-0 transform transition-transform hover:scale-[1.02] duration-500">

                {/* Simulated Glass Highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                <div className="flex items-center justify-between px-6 mb-8">
                  <div className="flex gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56] shadow-[0_0_10px_#FF5F56]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] shadow-[0_0_10px_#FFBD2E]"></div>
                    <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F] shadow-[0_0_10px_#27C93F]"></div>
                  </div>
                  <div className="px-3 py-1 bg-[#13a4ec]/20 text-[#13a4ec] rounded-md text-[10px] font-bold tracking-widest uppercase border border-[#13a4ec]/20 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#13a4ec] animate-ping"></span>
                    Live Analysis
                  </div>
                </div>

                <div className="px-6 mb-10 w-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "83.333%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-4 bg-[#2B394A] rounded mb-3 overflow-hidden"
                  >
                    <div className="w-full h-full bg-slate-600/50 animate-pulse"></div>
                  </motion.div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-4 bg-[#2B394A] rounded overflow-hidden"
                  >
                    <div className="w-full h-full bg-slate-600/50 animate-pulse delay-75"></div>
                  </motion.div>
                </div>

                {/* Simulated Audio Waveform */}
                <div className="flex items-center justify-start gap-3 h-32 px-10 mb-8 w-full border-b border-[#212E3B] pb-8">
                  {[40, 100, 50, 80, 100, 60, 90, 75, 50].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 10 }}
                      animate={{ height: `${height}%` }}
                      transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 0.4 + (i * 0.1),
                        ease: "easeInOut"
                      }}
                      className={`w-1.5 rounded-full ${i % 2 === 0 ? 'bg-slate-500' : 'bg-[#13a4ec] shadow-[0_0_8px_#13a4ec]'}`}
                    />
                  ))}
                </div>

                <div className="px-6 grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="border border-[#2B394A] bg-[#212E3B]/50 rounded-xl h-24 p-4 flex flex-col justify-center"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Clarity Score</span>
                    <span className="text-2xl font-black text-[#27C93F]">92%</span>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="border border-[#2B394A] bg-[#212E3B]/50 rounded-xl h-24 p-4 flex flex-col justify-center"
                  >
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Fillers Count</span>
                    <span className="text-2xl font-black text-[#FFBD2E]">2.4<span className="text-sm">/min</span></span>
                  </motion.div>
                </div>
              </div>
            </motion.div>

          </div>
        </section>


        {/* Features Section */}
        <section id="features" className="py-24 px-6 w-full flex justify-center bg-[#0D131B] relative border-t border-[#212E3B]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#13a4ec]/40 to-transparent"></div>

          <div className="max-w-[1200px] w-full flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-center mb-20 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2531] border border-[#2D3F51] mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[#8B9BB4]">Capabilities</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Analyze. <span className="text-[#13a4ec]">Improve.</span> Excel.
              </h2>
              <p className="text-[#8B9BB4] text-lg font-medium">
                Our comprehensive toolset provides deep insights into your speech patterns, helping you communicate with maximum impact.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {[
                { icon: "bar_chart", title: "Clarity Score", desc: "Get a real-time score on how effectively you communicate ideas and present information." },
                { icon: "spellcheck", title: "Grammar Analysis", desc: "Detailed breakdown of sentence structure and grammatical flow in spoken conversation." },
                { icon: "mood", title: "Tone Detection", desc: "Understand the emotional impact and professionalism level of your voice automatically." },
                { icon: "mic_none", title: "Filler Tracking", desc: "Identify and reduce 'umms', 'ahhs', and long thinking gaps to sound more confident." }
              ].map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="bg-[#17212B] border border-[#212E3B] rounded-2xl p-8 hover:border-[#13a4ec]/50 transition-colors shadow-lg group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#13a4ec]/5 rounded-bl-full flex -z-10 group-hover:bg-[#13a4ec]/10 transition-colors"></div>
                  <div className="w-14 h-14 bg-[#1B2939] rounded-xl flex items-center justify-center mb-6 border border-[#212E3B] shadow-inner group-hover:shadow-[0_0_15px_rgba(19,164,236,0.3)] group-hover:bg-[#13a4ec]/10 transition-all">
                    <span className="material-symbols-outlined text-[#13a4ec] text-[28px]">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-[#8B9BB4] text-[15px] leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="py-24 px-6 w-full flex justify-center bg-[#111822]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-[1000px] w-full bg-gradient-to-br from-[#13a4ec] to-[#0b5f8a] rounded-[2.5rem] p-12 md:p-16 text-center shadow-[0_20px_50px_rgba(19,164,236,0.25)] relative overflow-hidden"
          >
            {/* Decorative blobs inside CTA */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/20 rounded-full blur-[80px]"></div>
            <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-black/20 rounded-full blur-[80px]"></div>

            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] opacity-50 block mix-blend-overlay pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                Ready to speak with<br />total confidence?
              </h2>
              <p className="text-white/80 text-lg mb-12 max-w-xl font-medium">
                Join thousands of leaders who are already improving their communication with SpeakClear.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link href="/login" className="bg-white text-[#13a4ec] hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold transition-all w-full sm:w-auto shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                  Start Your Free Trial
                </Link>
                <button className="bg-[#0b5f8a]/40 backdrop-blur-md hover:bg-[#0b5f8a]/70 text-white border border-white/20 px-10 py-4 rounded-xl text-lg font-bold transition-all w-full sm:w-auto hover:-translate-y-1">
                  Schedule a Demo
                </button>
              </div>
            </div>
          </motion.div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0D131B] border-t border-[#212E3B] pt-16 pb-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[#13a4ec] p-1.5 rounded flex items-center justify-center shadow-[0_0_10px_rgba(19,164,236,0.3)]">
                <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">SpeakClear</h2>
            </div>
            <p className="text-[#8B9BB4] text-sm leading-relaxed pr-4 font-medium">
              Empowering professionals to communicate with clarity, precision, and confidence through AI.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Product</h4>
            <ul className="space-y-4">
              {['Features', 'Analysis Tools', 'Pricing Plans'].map(link => (
                <li key={link}><Link href="#" className="text-[#8B9BB4] hover:text-[#13a4ec] text-sm transition font-medium relative group">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#13a4ec] transition-all group-hover:w-full"></span>
                </Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Resources</h4>
            <ul className="space-y-4">
              {['Speech Guide', 'Case Studies', 'Help Center'].map(link => (
                <li key={link}><Link href="#" className="text-[#8B9BB4] hover:text-[#13a4ec] text-sm transition font-medium relative group">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#13a4ec] transition-all group-hover:w-full"></span>
                </Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Follow Us</h4>
            <div className="flex gap-4">
              {['public', 'alternate_email'].map(icon => (
                <a href="#" key={icon} className="w-10 h-10 rounded-full bg-[#1B2531] border border-[#2D3F51] flex items-center justify-center text-[#8B9BB4] hover:bg-[#13a4ec] hover:border-[#13a4ec] hover:text-white transition-all hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(19,164,236,0.3)]">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#212E3B] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#8B9BB4] text-xs font-medium tracking-wide">© 2024 SpeakClear AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-[#8B9BB4] hover:text-white text-xs font-medium transition">Privacy Policy</Link>
            <Link href="#" className="text-[#8B9BB4] hover:text-white text-xs font-medium transition">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
