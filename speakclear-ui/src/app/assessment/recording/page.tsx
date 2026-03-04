"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function RecordingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || 'The Impact of Remote Work on Team Collaboration';

    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [username, setUsername] = useState("");

    useEffect(() => {
        setIsMounted(true);
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
        } else {
            router.push("/login");
        }
    }, [router]);

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused && isMounted) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, isMounted]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isMounted) return null;

    return (
        <div className="flex h-screen bg-[#0B0F15] text-slate-200 overflow-hidden font-sans">
            {/* Sidebar with Lifetime Scores */}
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto relative flex flex-col">
                {/* Header / Breadcrumbs */}
                <div className="px-12 py-8 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-black uppercase tracking-widest">
                        <span className="hover:text-[#13a4ec] cursor-pointer transition-colors" onClick={() => router.push('/assessment')}>Assessments</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Live Recording</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                            <motion.div
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                            />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Live</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white/5 p-0.5">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-black text-white/50">
                                JD
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-5xl mx-auto w-full px-12 pt-16 pb-32 flex flex-col items-center">
                    {/* Topic Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <span className="text-[11px] font-black text-[#13a4ec] uppercase tracking-[0.3em] mb-4 block">Current Topic</span>
                        <h1 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
                            {topic}
                        </h1>
                        <p className="text-slate-500 font-medium text-base">
                            Focus on maintaining a steady pace and minimizing filler words like "um" or "ah".
                        </p>
                    </motion.div>

                    {/* Waveform Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full bg-[#121820]/40 border border-white/5 rounded-[40px] p-16 mb-16 relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-8 right-12 flex items-center gap-3">
                            <span className="text-2xl font-black text-[#13a4ec] tracking-tighter tabular-nums">{formatTime(seconds)}</span>
                            <span className="material-symbols-outlined text-[#13a4ec] text-xl">timer</span>
                        </div>

                        {/* Animated Waveform */}
                        <div className="flex items-center justify-center gap-1.5 h-48">
                            {[...Array(40)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        height: isPaused ? 4 : [
                                            Math.random() * 40 + 20,
                                            Math.random() * 120 + 40,
                                            Math.random() * 40 + 20
                                        ],
                                        opacity: isPaused ? 0.3 : [0.4, 1, 0.4]
                                    }}
                                    transition={{
                                        duration: 0.4 + (i * 0.02),
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1.5 rounded-full bg-gradient-to-t from-[#13a4ec] to-[#0ea5e9]/40"
                                />
                            ))}
                        </div>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-16">
                        <div className="flex flex-col items-center gap-4 group">
                            <button
                                onClick={() => setIsPaused(!isPaused)}
                                className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center text-white hover:border-[#13a4ec] hover:bg-[#13a4ec]/10 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">{isPaused ? 'play_arrow' : 'pause'}</span>
                            </button>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#13a4ec] transition-colors">
                                {isPaused ? 'Resume' : 'Pause'}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={() => router.push('/assessment/analysis')}
                                className="w-24 h-24 rounded-full bg-[#13a4ec] shadow-2xl shadow-[#13a4ec]/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-500 group relative"
                            >
                                {!isPaused && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-[#13a4ec] blur-xl"
                                    />
                                )}
                                <span className="material-symbols-outlined text-4xl relative z-10 font-bold">stop</span>
                            </button>
                            <span className="text-[11px] font-black text-[#13a4ec] uppercase tracking-[0.2em]">Finish Assessment</span>
                        </div>

                        <div className="flex flex-col items-center gap-4 group">
                            <button
                                onClick={() => router.push('/assessment')}
                                className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl text-red-500/80">close</span>
                            </button>
                            <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest group-hover:text-red-500 transition-colors">Discard</span>
                        </div>
                    </div>
                </div>

                {/* Footer Metrics */}
                <div className="fixed bottom-0 left-[280px] right-0 py-8 px-12 border-t border-white/5 bg-[#0B0F15]/80 backdrop-blur-2xl z-20">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Clarity Score</span>
                            <div className="flex items-center gap-4">
                                <div className="w-40 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: isPaused ? "85%" : ["82%", "88%", "85%"] }}
                                        transition={{ duration: 2, repeat: isPaused ? 0 : Infinity }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    />
                                </div>
                                <span className="text-xs font-black text-emerald-500 tracking-widest">85%</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Thinking Gaps</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[#13a4ec] text-lg">location_on</span>
                                <span className="text-sm font-black text-white tracking-widest uppercase">2 detected</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Pace (WPM)</span>
                            <div className="flex items-center justify-end gap-2">
                                <span className="material-symbols-outlined text-amber-500 text-lg">speed</span>
                                <span className="text-sm font-black text-white tracking-widest">142</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
