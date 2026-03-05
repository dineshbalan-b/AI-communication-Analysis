"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ResultsPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        setIsMounted(true);
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
        } else {
            router.push("/login");
        }

        const storedResults = sessionStorage.getItem("last_analysis_result");
        if (storedResults) {
            setResults(JSON.parse(storedResults));
        }
    }, [router]);

    if (!isMounted) return null;

    // Use actual results or fallbacks if something went wrong
    const metrics = results?.metrics || { wpm: 0, filler_count: 0, speech_ratio: 0 };
    const evalData = results?.evaluation || {
        grammar: 0, vocabulary: 0, clarity: 0, confidence: 0, relevance: 0,
        final_feedback: "Evaluation data not available.",
        improvements: "No suggestions available."
    };
    const finalScore = results?.final_score || 0;

    const stats = [
        { label: "OVERALL SCORE", value: finalScore.toString(), sub: "/100", trend: results ? "Session analyzed" : "No data", trendColor: "text-emerald-500", icon: "assessment", iconColor: "text-[#13a4ec]" },
        { label: "FILLER WORDS", value: metrics.filler_count.toString(), sub: "", trend: "Detected in transcript", trendColor: "text-amber-500", icon: "do_not_disturb_on", iconColor: "text-amber-500" },
        { label: "SPEECH RATE", value: Math.round(metrics.wpm).toString(), sub: "wpm", trend: metrics.wpm > 130 && metrics.wpm < 160 ? "Ideal pace" : "Adjust pace", trendColor: "text-emerald-500", icon: "speed", iconColor: "text-[#13a4ec]" },
        { label: "SPEECH RATIO", value: Math.round(metrics.speech_ratio * 100).toString(), sub: "%", trend: "Active speaking time", trendColor: "text-emerald-500", icon: "hourglass_empty", iconColor: "text-emerald-500" },
    ];

    const breakdowns = [
        { label: "Grammar & Structure", value: evalData.grammar * 10, color: "bg-[#13a4ec]" },
        { label: "Vocabulary Richness", value: evalData.vocabulary * 10, color: "bg-[#13a4ec]" },
        { label: "Communication Clarity", value: evalData.clarity * 10, color: "bg-[#13a4ec]" },
        { label: "Confidence Perception", value: evalData.confidence * 10, color: "bg-[#13a4ec]" },
    ];

    return (
        <div className="flex h-screen bg-[#0B0F15] text-slate-200 overflow-hidden font-sans">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto pt-24 md:pt-0 relative pb-20">
                <div className="px-6 md:px-12 py-10">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Sessions</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Session Results</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6 md:gap-0">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Session Results & Feedback</h1>
                            <p className="text-slate-400 font-medium text-lg">
                                Comprehensive verbal impact analysis and AI-driven growth metrics.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-[#13a4ec] hover:bg-[#108CCC] text-white px-8 py-4 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#13a4ec]/20 active:scale-95"
                        >
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            Back to Dashboard
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[#121820]/40 border border-white/5 rounded-3xl p-8 relative group overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                                    <span className={`material-symbols-outlined ${stat.iconColor} text-xl opacity-50 group-hover:opacity-100 transition-opacity`}>
                                        {stat.icon}
                                    </span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-5xl font-black text-white tracking-tighter tabular-nums">{stat.value}</span>
                                    {stat.sub && <span className="text-lg font-bold text-slate-500">{stat.sub}</span>}
                                </div>
                                <div className={`text-[10px] font-black ${stat.trendColor} uppercase tracking-widest flex items-center gap-2`}>
                                    <span className="material-symbols-outlined text-sm">info</span>
                                    {stat.trend}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-col xl:grid xl:grid-cols-12 gap-8">
                        {/* Left Column: Metrics and Transcript */}
                        <div className="col-span-5 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#121820]/40 border border-white/5 rounded-[32px] p-8 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-10">
                                    <span className="material-symbols-outlined text-[#13a4ec]">bar_chart</span>
                                    <h3 className="text-lg font-black text-white tracking-tight">Metric Breakdown</h3>
                                </div>

                                <div className="space-y-10">
                                    {breakdowns.map((m) => (
                                        <div key={m.label}>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-[13px] font-bold text-slate-300">{m.label}</span>
                                                <span className="text-xs font-black text-white">{m.value}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${m.value}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className={`h-full ${m.color} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-16 pt-10 border-t border-white/5">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Detected Transcript</h4>
                                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl h-48 overflow-y-auto">
                                        <p className="text-sm text-slate-400 leading-relaxed italic">
                                            "{results?.transcript || "Wait, no transcript was generated."}"
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: AI Feedback */}
                        <div className="xl:col-span-7 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-[#121820]/40 border border-white/5 rounded-[32px] p-10 shadow-xl"
                            >
                                <div className="flex items-center gap-4 mb-10">
                                    <div className="w-12 h-12 bg-[#13a4ec]/10 rounded-2xl flex items-center justify-center text-[#13a4ec]">
                                        <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tight">AI Feedback & Suggestions</h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tailored coaching summary</p>
                                    </div>
                                </div>

                                <div className="bg-[#13a4ec]/5 border border-[#13a4ec]/20 rounded-[24px] p-8 mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <span className="material-symbols-outlined text-6xl text-[#13a4ec]">lightbulb</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <span className="material-symbols-outlined text-[#13a4ec] text-xl">tips_and_updates</span>
                                        <h4 className="text-xs font-black text-[#13a4ec] uppercase tracking-[0.2em]">Summary Evaluation</h4>
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed relative z-10">
                                        {evalData.final_feedback}
                                    </p>
                                </div>

                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">Coaching Advice</h4>
                                <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl">
                                    <div className="flex gap-6">
                                        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center bg-emerald-500/10 text-emerald-500">
                                            <span className="material-symbols-outlined text-xl">trending_up</span>
                                        </div>
                                        <div>
                                            <h5 className="text-[15px] font-black text-white mb-2 tracking-tight">Areas to Focus On</h5>
                                            <p className="text-sm text-slate-400 font-medium leading-relaxed whitespace-pre-line">
                                                {evalData.improvements}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-4 mt-16 pt-10 border-t border-white/5">
                                    <button
                                        onClick={() => window.print()}
                                        className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-3"
                                    >
                                        <span className="material-symbols-outlined text-lg">print</span>
                                        Print Report
                                    </button>
                                    <button
                                        onClick={() => router.push('/dashboard')}
                                        className="flex-1 py-4 bg-white text-[#0B0F15] hover:bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3"
                                    >
                                        Finish Practice
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-16 bg-[#13a4ec] rounded-[32px] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group gap-8 md:gap-0"
                    >
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-30deg] translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl">
                                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Keep the momentum going!</h2>
                                <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Regular practice is the fastest way to master communication.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/assessment')}
                            className="bg-white text-[#13a4ec] px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 relative z-10"
                        >
                            Start Next Practice
                        </button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
