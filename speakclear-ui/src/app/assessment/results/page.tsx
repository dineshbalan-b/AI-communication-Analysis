"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function ResultsPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
        } else {
            router.push("/login");
        }
    }, [router]);

    if (!isMounted) return null;

    const stats = [
        { label: "OVERALL SCORE", value: "84", sub: "/100", trend: "+5% from last session", trendColor: "text-emerald-500", icon: "assessment", iconColor: "text-[#13a4ec]" },
        { label: "FILLER WORDS", value: "12", sub: "", trend: "+2 \"ums\" detected", trendColor: "text-amber-500", icon: "do_not_disturb_on", iconColor: "text-amber-500" },
        { label: "SPEECH RATE", value: "145", sub: "wpm", trend: "Ideal pace maintained", trendColor: "text-emerald-500", icon: "speed", iconColor: "text-[#13a4ec]" },
        { label: "THINKING GAPS", value: "04", sub: "total", trend: "-15% duration", trendColor: "text-emerald-500", icon: "hourglass_empty", iconColor: "text-emerald-500" },
    ];

    const breakdowns = [
        { label: "Enunciation Clarity", value: 92, color: "bg-[#13a4ec]" },
        { label: "Grammar & Structure", value: 88, color: "bg-[#13a4ec]" },
        { label: "Tone Consistency", value: 76, color: "bg-[#13a4ec]" },
        { label: "Thinking Gaps", value: 65, color: "bg-orange-500" },
    ];

    const fillers = [
        { label: "\"Um / Ah\"", count: 12 },
        { label: "\"Like\"", count: 5 },
        { label: "\"So\"", count: 8 },
        { label: "\"You know\"", count: 3 },
    ];

    const improvements = [
        {
            title: "Reduce Transition Fillers",
            text: "We noticed a spike in \"ums\" and \"ahs\" specifically when transitioning between the project scope and the budget section. Tip: Try to pause for 1 second instead of filling the silence when moving to a new topic.",
            icon: "psychology",
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Pitch Variation",
            text: "During the data analysis part, your pitch became somewhat monotone. Varying your inflection slightly more can help keep the audience engaged during dense information sections.",
            icon: "record_voice_over",
            color: "text-[#13a4ec]",
            bg: "bg-[#13a4ec]/10"
        },
        {
            title: "Clarity on Complex Terms",
            text: "Enunciation dropped slightly when pronouncing \"multidimentional\" and \"infrastructure\". Practice these specific multi-syllabic words to maintain 95%+ clarity.",
            icon: "trending_up",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
    ];

    return (
        <div className="flex h-screen bg-[#0B0F15] text-slate-200 overflow-hidden font-sans">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto relative pb-20">
                {/* Header Section */}
                <div className="px-12 py-10">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Sessions</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Session #1042 - Clarity Analysis</span>
                    </div>

                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">Session Results & Feedback</h1>
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
                    <div className="grid grid-cols-4 gap-6 mb-12">
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
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    {stat.trend}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="grid grid-cols-12 gap-8">
                        {/* Left Column: Metrics and Fillers */}
                        <div className="col-span-4 space-y-8">
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
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Specific Filler Counts</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {fillers.map((f) => (
                                            <div key={f.label} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex items-center justify-between group hover:border-[#13a4ec]/30 transition-colors">
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{f.label}</span>
                                                <span className="text-sm font-black text-white">{f.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column: AI Feedback */}
                        <div className="col-span-8 space-y-8">
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
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Tailored coaching based on Session #1042</p>
                                    </div>
                                </div>

                                {/* Strengths Box */}
                                <div className="bg-[#13a4ec]/5 border border-[#13a4ec]/20 rounded-[24px] p-8 mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                        <span className="material-symbols-outlined text-6xl text-[#13a4ec]">lightbulb</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <span className="material-symbols-outlined text-[#13a4ec] text-xl">tips_and_updates</span>
                                        <h4 className="text-xs font-black text-[#13a4ec] uppercase tracking-[0.2em]">Key Strengths</h4>
                                    </div>
                                    <p className="text-slate-300 font-medium leading-relaxed max-w-2xl relative z-10">
                                        Your opening statement was exceptionally clear. You maintained a strong rhythmic flow during the middle 2 minutes of the presentation, showing high confidence in the technical subject matter. Your tone was professional yet approachable.
                                    </p>
                                </div>

                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-8">Areas for Improvement</h4>
                                <div className="space-y-6">
                                    {improvements.map((item, id) => (
                                        <div key={id} className="flex gap-6 p-6 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                                            <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center ${item.bg}`}>
                                                <span className={`material-symbols-outlined ${item.color} text-xl`}>{item.icon}</span>
                                            </div>
                                            <div>
                                                <h5 className="text-[15px] font-black text-white mb-2 tracking-tight">{item.title}</h5>
                                                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                                    {item.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-4 mt-16 pt-10 border-t border-white/5">
                                    <button className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest border border-white/5 transition-all">
                                        View Full Transcript
                                    </button>
                                    <button className="flex-1 py-4 bg-white text-[#0B0F15] hover:bg-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                        <span className="material-symbols-outlined text-lg">share</span>
                                        Export PDF
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Bottom CTA */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-16 bg-[#13a4ec] rounded-[32px] p-12 flex items-center justify-between relative overflow-hidden group"
                    >
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-30deg] translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <div className="flex items-center gap-8 relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-xl">
                                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Ready for your next session?</h2>
                                <p className="text-white/70 font-bold uppercase text-[10px] tracking-widest">Apply these suggestions in a practice run to see your score grow.</p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/assessment')}
                            className="bg-white text-[#13a4ec] px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-2xl transition-all hover:scale-105 active:scale-95 relative z-10"
                        >
                            Start New Session
                        </button>
                    </motion.div>
                </div>

                {/* Visual Footer */}
                <footer className="px-12 py-10 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest">
                    <span>© 2024 SpeakClear AI. All rights reserved.</span>
                    <div className="flex items-center gap-8">
                        <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
                        <span className="hover:text-white cursor-pointer transition-colors">Contact Support</span>
                    </div>
                </footer>
            </main>
        </div>
    );
}
