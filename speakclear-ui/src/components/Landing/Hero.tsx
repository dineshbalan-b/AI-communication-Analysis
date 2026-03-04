"use client";

import { motion, type Variants } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

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

export default function Hero() {
    return (
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
                            <div className="border border-[#2B394A] bg-[#212E3B]/50 rounded-xl h-24 p-4 flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Clarity Score</span>
                                <span className="text-2xl font-black text-[#27C93F]">92%</span>
                            </div>
                            <div className="border border-[#2B394A] bg-[#212E3B]/50 rounded-xl h-24 p-4 flex flex-col justify-center">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Fillers Count</span>
                                <span className="text-2xl font-black text-[#FFBD2E]">2.4<span className="text-sm">/min</span></span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
