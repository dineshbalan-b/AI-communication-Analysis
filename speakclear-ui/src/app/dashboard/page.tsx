"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [username, setUsername] = useState("");
    const router = useRouter();

    useEffect(() => {
        const un = localStorage.getItem("username");
        if (!un) {
            router.push("/login");
        } else {
            setUsername(un);
        }
    }, [router]);

    if (!username) return null;

    const stats = [
        { name: "Clarity", score: 92, feedback: "Outstanding articulation and pronunciation.", color: "#13a4ec" },
        { name: "Grammar", score: 78, feedback: "Occasional minor syntax errors observed.", color: "#FFBD2E" },
        { name: "Communication", score: 88, feedback: "Very high engagement and flow consistency.", color: "#45EBA5" },
        { name: "Tone", score: 81, feedback: "Professional and warm delivery style.", color: "#A87FF3" },
    ];

    const attempts = [
        { date: "Oct 24, 2023", time: "02:45 PM", topic: "Technical Project Update", tag: "Professional", tagColor: "#13a4ec", feedback: "Clear articulation, but \"thinking gaps\"...", trend: [4, 7, 5, 8] },
        { date: "Oct 22, 2023", time: "11:15 AM", topic: "Mock Client Pitch", tag: "Sales", tagColor: "#45EBA5", feedback: "Dynamic tone and excellent engagement...", trend: [6, 5, 8, 7] },
        { date: "Oct 21, 2023", time: "09:00 AM", topic: "Daily Scum Update", tag: "Routine", tagColor: "#A87FF3", feedback: "Grammar inconsistencies noted in fast-...", trend: [3, 4, 3, 5] },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto p-10 relative">
                {/* Header */}
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-white tracking-tight">User Dashboard</h2>
                    <div className="flex items-center gap-6">
                        <motion.button whileHover={{ scale: 1.1 }} className="text-slate-400 hover:text-white relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-0 right-0 w-2 h-2 bg-[#FF5F56] rounded-full border-2 border-[#0B0F15]"></span>
                        </motion.button>
                        <div className="flex items-center gap-3 border-l border-[#212E3B] pl-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-tight">Alex Rivera</p>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-wider">Free Tier</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#1B2939] border border-[#212E3B] flex items-center justify-center overflow-hidden">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="User" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8 mb-10">
                    {/* Overall Performance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121820] border border-[#212E3B] rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#13a4ec]/5 rounded-full blur-3xl group-hover:bg-[#13a4ec]/10 transition-all"></div>
                        <h3 className="text-lg font-bold text-white mb-10 self-start">Overall Performance</h3>

                        <div className="relative w-56 h-56 flex items-center justify-center">
                            {/* Circular Progress (SVG) */}
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="112" cy="112" r="95" stroke="rgba(255,255,255,0.05)" strokeWidth="12" fill="none" />
                                <motion.circle
                                    cx="112" cy="112" r="95"
                                    stroke="#13a4ec" strokeWidth="12" fill="none"
                                    strokeDasharray="596"
                                    initial={{ strokeDashoffset: 596 }}
                                    animate={{ strokeDashoffset: 596 - (596 * 0.85) }}
                                    transition={{ duration: 2, ease: "easeOut" }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white">85%</span>
                                <span className="text-[10px] font-black text-[#13a4ec] uppercase tracking-[0.3em] mt-1">Excellent</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full mt-10 gap-10">
                            <div>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-1">Weekly Growth</p>
                                <p className="text-xl font-bold text-[#45EBA5]">+12.4%</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-1">Global Rank</p>
                                <p className="text-xl font-bold text-white">Top 5%</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-[#121820] border border-[#212E3B] rounded-3xl p-8 flex flex-col justify-between group cursor-default transition-all hover:border-[#13a4ec]/30 shadow-xl"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl bg-white/5 text-slate-400 group-hover:bg-[#13a4ec]/10 group-hover:text-[#13a4ec] transition-colors`}>
                                        <span className="material-symbols-outlined">{idx === 0 ? 'person_voice' : idx === 1 ? 'translate' : idx === 2 ? 'forum' : 'sentiment_satisfied'}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-xl font-black text-white`}>{stat.score}<span className="text-xs text-[#4B6A88] ml-1 font-bold">/100</span></span>
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest mt-1">{stat.name}</h4>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.score}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1) }}
                                            style={{ backgroundColor: stat.color }}
                                            className="h-full rounded-full"
                                        />
                                    </div>
                                    <p className="text-xs text-[#8B9BB4] font-medium leading-relaxed">{stat.feedback}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Recent Attempts Table */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#121820] border border-[#212E3B] rounded-3xl overflow-hidden shadow-2xl"
                >
                    <div className="p-8 border-b border-[#212E3B] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Recent Attempts</h3>
                        <button className="text-[#13a4ec] text-xs font-bold uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-[#212E3B]">
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Date & Time</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Topic / Session</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Metric Trends</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Overall Feedback</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt, idx) => (
                                    <tr key={idx} className="border-b border-[#212E3B]/50 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-white mb-1">{attempt.date}</p>
                                            <p className="text-[10px] font-medium text-[#4B6A88]">{attempt.time}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-bold text-white mb-2">{attempt.topic}</p>
                                            <span className="px-3 py-1 bg-[#13a4ec]/10 text-[#13a4ec] rounded text-[9px] font-black uppercase tracking-wider border border-[#13a4ec]/20" style={{ color: attempt.tagColor, backgroundColor: `${attempt.tagColor}15`, borderColor: `${attempt.tagColor}30` }}>
                                                {attempt.tag}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-end gap-1 h-8">
                                                {attempt.trend.map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h * 10}%` }}
                                                        transition={{ duration: 1, delay: 1 + (idx * 0.2) + (i * 0.1) }}
                                                        className="w-1.5 bg-[#13a4ec] rounded-t-sm"
                                                        style={{ backgroundColor: attempt.tagColor }}
                                                    />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs">
                                            <p className="text-xs text-[#8B9BB4] leading-relaxed truncate">{attempt.feedback}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="text-slate-500 hover:text-white transition-colors">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
