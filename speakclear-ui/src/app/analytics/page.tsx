"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function AnalyticsPage() {
    const [username, setUsername] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const un = localStorage.getItem("username");
        if (!un) {
            router.push("/login");
        } else {
            setUsername(un);
            fetchHistory(un);
        }
    }, [router]);

    const fetchHistory = async (user: string) => {
        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/progress?username=${user}`);
            const data = await resp.json();
            if (data.status === "success") {
                setHistory(data.data); // Chronological order for charts
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!username) return null;

    const avgScore = history.length > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length)
        : 0;

    const highestScore = history.length > 0
        ? Math.max(...history.map(h => h.score))
        : 0;

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto p-12 relative">
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Analytics</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Performance Analytics</h2>
                    <p className="text-slate-400 mt-2 font-medium">Data-driven insights into your communication growth.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#121820] border border-[#212E3B] p-8 rounded-3xl shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">AVERAGE SCORE</p>
                        <h4 className="text-5xl font-black text-white">{avgScore}%</h4>
                        <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${avgScore}%` }} className="h-full bg-[#13a4ec]" />
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#121820] border border-[#212E3B] p-8 rounded-3xl shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">SESSIONS COMPLETED</p>
                        <h4 className="text-5xl font-black text-[#45EBA5]">{history.length}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-4">Total practice time: {history.length * 5} mins approx.</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#121820] border border-[#212E3B] p-8 rounded-3xl shadow-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">PERSONAL BEST</p>
                        <h4 className="text-5xl font-black text-[#A87FF3]">{highestScore}%</h4>
                        <p className="text-xs text-slate-500 font-bold mt-4">Peak performance achieved Recently</p>
                    </motion.div>
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-10 shadow-2xl overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-1">Score Progression</h3>
                            <p className="text-sm text-slate-500 font-medium">Tracking improvement across all recorded sessions.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#13a4ec]" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Trend</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-80 w-full relative flex items-end gap-3 px-12 pt-10 border-b border-[#212E3B] pb-4">
                        {/* Chart Grid Lines (Background) */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-4 pb-0 z-0 pr-12">
                            {[100, 75, 50, 25, 0].map(v => (
                                <div key={v} className="w-full border-t border-white/20 flex justify-end">
                                    <span className="text-[10px] font-black text-slate-500 -translate-y-[60%] mr-2">{v}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Internal bars container */}
                        <div className="flex-1 w-full h-full flex items-end gap-3 relative z-10 pl-6 pb-2">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-slate-500 italic font-bold">Loading growth data...</p>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-slate-500 italic font-bold">No sessions yet to visualize.</p>
                                </div>
                            ) : (
                                // Take only up to the last 15 sessions and reverse for chronological order
                                [...history].reverse().slice(-15).map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                        <div className="w-full relative flex flex-col items-center justify-end h-full">
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${h.score}%` }}
                                                transition={{ duration: 1, delay: i * 0.1 }}
                                                className="w-full max-w-[40px] bg-[#13a4ec]/20 hover:bg-[#13a4ec]/40 border-t-2 border-[#13a4ec] rounded-t-lg transition-all relative group-hover:shadow-[0_0_20px_rgba(19,164,236,0.2)]"
                                            >
                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#1B2939] border border-[#212E3B] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-xl">
                                                    <p className="text-[10px] font-black text-white">{h.score}%</p>
                                                </div>
                                            </motion.div>
                                        </div>
                                        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter text-center">
                                            S#{i + 1}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.section>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-20">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-10 shadow-xl">
                        <h4 className="text-lg font-bold text-white mb-6">Communicative Insights</h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="material-symbols-outlined text-emerald-500 text-2xl">trending_up</span>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Upward Trajectory</p>
                                    <p className="text-xs text-slate-500">Your average score has increased by 15% since your first week.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="material-symbols-outlined text-[#13a4ec] text-2xl">speed</span>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Target Pace Reached</p>
                                    <p className="text-xs text-slate-500">Your speech rate is stabilizing in the Ideal zone (130-150 WPM).</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-10 shadow-xl">
                        <h4 className="text-lg font-bold text-white mb-6">Growth Strategy</h4>
                        <ul className="space-y-4">
                            {['Reduce filler words in technical segments', 'Improve pitch variation during introductions', 'Maintain eye contact for video assessments'].map((tip, i) => (
                                <li key={i} className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#13a4ec]" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
