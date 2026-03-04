"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    const statusItems = [
        { id: 1, label: "Analyzing Clarity...", target: 30 },
        { id: 2, label: "Checking Grammar...", target: 55 },
        { id: 3, label: "Identifying Thinking Gaps...", target: 85 },
        { id: 4, label: "Scanning Filler Words...", target: 100 },
    ];

    useEffect(() => {
        setIsMounted(true);
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => router.push('/assessment/results'), 1500);
                    return 100;
                }
                return prev + 1;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [router]);

    if (!isMounted) return null;

    const getStatus = (target: number) => {
        if (progress >= target) return { label: "COMPLETED", color: "text-emerald-500", icon: "check_circle" };
        if (progress > target - 25) return { label: "IN PROGRESS", color: "text-[#13a4ec]", icon: "sync" }; // Animated sync in JSX
        return { label: "PENDING", color: "text-slate-600", icon: "schedule" };
    };

    return (
        <div className="min-h-screen bg-[#0B1219] text-slate-200 font-sans flex flex-col">
            {/* Top Navigation */}
            <nav className="px-12 py-6 flex items-center justify-between border-b border-white/5 bg-[#0B1219]/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#13a4ec] rounded-xl flex items-center justify-center shadow-lg shadow-[#13a4ec]/20">
                        <span className="material-symbols-outlined text-white text-2xl">graphic_eq</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">SpeakClear</span>
                </div>

                <div className="flex items-center gap-10">
                    {['Dashboard', 'History', 'Resources', 'Settings'].map((item) => (
                        <button
                            key={item}
                            onClick={() => router.push(`/${item.toLowerCase()}`)}
                            className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
                        >
                            {item}
                        </button>
                    ))}
                    <div className="w-10 h-10 rounded-full border border-white/10 p-0.5 ml-4">
                        <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-[#13a4ec]">
                            <span className="material-symbols-outlined text-xl">person</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full py-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-5xl font-black text-white mb-6 tracking-tight">AI Analysis in Progress</h1>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
                        SpeakClear is evaluating your verbal clarity, thinking patterns, and delivery metrics using advanced neural networks.
                    </p>
                </motion.div>

                {/* Central Visualization Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full bg-[#121820]/40 border border-white/5 rounded-[40px] p-20 mb-16 relative overflow-hidden flex flex-col items-center justify-center shadow-2xl"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#13a4ec]/5 to-transparent pointer-events-none" />

                    <motion.div
                        animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                "0 0 40px rgba(19, 164, 236, 0.2)",
                                "0 0 70px rgba(19, 164, 236, 0.4)",
                                "0 0 40px rgba(19, 164, 236, 0.2)"
                            ]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-32 h-32 bg-[#13a4ec] rounded-full flex items-center justify-center relative z-10 mb-10"
                    >
                        <span className="material-symbols-outlined text-white text-5xl">psychology</span>
                    </motion.div>

                    <div className="flex items-center gap-1.5 h-12 relative z-10">
                        {[...Array(9)].map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [16, 40, 16],
                                    opacity: [0.4, 1, 0.4]
                                }}
                                transition={{
                                    duration: 0.6 + (i * 0.1),
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="w-1.5 rounded-full bg-[#13a4ec]/60"
                            />
                        ))}
                    </div>
                </motion.div>

                {/* Progress Indicators Section */}
                <div className="w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Overall Analysis Progress</span>
                        <span className="text-xl font-black text-[#13a4ec] tabular-nums">{progress}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden mb-4 p-0.5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-[#13a4ec] rounded-full shadow-[0_0_20px_rgba(19,164,236,0.3)] relative"
                        >
                            <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-r from-transparent to-white/30 skew-x-[-20deg]" />
                        </motion.div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-500 italic mb-12 text-right">
                        {progress < 100 ? "Almost there, finalizing data extraction..." : "Analysis complete! Finalizing report..."}
                    </p>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Status Indicators</h3>

                        {statusItems.map((item, idx) => {
                            const status = getStatus(item.target);
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: progress < item.target - 25 ? 0.3 : 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className={`flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 ${status.label === 'IN PROGRESS' ? 'bg-[#13a4ec]/5 border-[#13a4ec]/20' : 'bg-white/[0.02] border-white/5'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color.replace('text-', 'bg-').replace('500', '500/10')}`}>
                                            {status.label === 'IN PROGRESS' ? (
                                                <motion.span
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                    className={`material-symbols-outlined ${status.color} text-xl`}
                                                >
                                                    sync
                                                </motion.span>
                                            ) : (
                                                <span className={`material-symbols-outlined ${status.color} text-xl`}>{status.icon}</span>
                                            )}
                                        </div>
                                        <span className={`text-[14px] font-bold ${status.label === 'PENDING' ? 'text-slate-500' : 'text-white'}`}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <span className={`text-[10px] font-black tracking-widest uppercase ${status.color}`}>
                                        {status.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-20 flex flex-col items-center gap-8">
                    <p className="text-xs text-slate-500 font-medium">
                        Average processing time: 45 seconds per minute of audio.
                    </p>
                    <button
                        onClick={() => router.push('/assessment')}
                        className="px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-slate-300 uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all group"
                    >
                        <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg opacity-50 group-hover:opacity-100">cancel</span>
                            Cancel Analysis
                        </span>
                    </button>
                </div>
            </main>
        </div>
    );
}
