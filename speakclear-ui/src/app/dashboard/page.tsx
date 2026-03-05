"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const [username, setUsername] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [latestScore, setLatestScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [highestScore, setHighestScore] = useState(0);
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
                const sortedData = data.data; // Already sorted DESC from backend
                setHistory(sortedData);
                if (sortedData.length > 0) {
                    setLatestScore(sortedData[0].score);
                    setHighestScore(Math.max(...sortedData.map((h: any) => h.score)));
                }
            }
        } catch (err) {
            console.error("Failed to fetch history:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (sessionId: number) => {
        if (!confirm("Are you sure you want to delete this session?")) return;

        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/session/${sessionId}`, {
                method: 'DELETE'
            });
            const data = await resp.json();
            if (data.status === "success") {
                // Refresh history
                fetchHistory(username);
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };
    const handleViewDetails = (attempt: any) => {
        const payload = {
            transcript: attempt.transcript || "Transcript not available.",
            metrics: {
                wpm: attempt.wpm || 0,
                filler_count: attempt.filler_count || 0,
                speech_ratio: attempt.speech_ratio || 0
            },
            evaluation: {
                grammar: attempt.grammar || 0,
                vocabulary: attempt.vocabulary || 0,
                clarity: attempt.clarity || 0,
                confidence: attempt.confidence || 0,
                final_feedback: attempt.final_feedback || "No final feedback stored.",
                improvements: attempt.improvements || "No improvements stored."
            },
            final_score: attempt.score || 0
        };
        sessionStorage.setItem("last_analysis_result", JSON.stringify(payload));
        router.push("/assessment/results");
    };

    if (!username) return null;

    const average = (key: string) => {
        if (history.length === 0) return 0;
        const sum = history.reduce((acc, curr) => acc + (curr[key] || 0), 0);
        return Math.round((sum / history.length) * 10); // Scale 0-10 to 0-100
    };

    const stats = [
        {
            name: "Avg Clarity",
            score: average("clarity"),
            feedback: average("clarity") >= 80 ? "Your enunciation is professional." : "Practice clear articulation.",
            color: "#13a4ec"
        },
        {
            name: "Grammar",
            score: average("grammar"),
            feedback: average("grammar") >= 80 ? "Strong syntactic control." : "Focus on sentence structure.",
            color: "#FFBD2E"
        },
        {
            name: "Confidence",
            score: average("confidence"),
            feedback: average("confidence") >= 80 ? "Confident delivery." : "Work on your vocal presence.",
            color: "#45EBA5"
        },
        {
            name: "Vocabulary",
            score: average("vocabulary"),
            feedback: average("vocabulary") >= 80 ? "Rich word choice." : "Try using more varied synonyms.",
            color: "#A87FF3"
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto p-10 relative">
                <header className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-white tracking-tight">User Dashboard</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-l border-[#212E3B] pl-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-tight">{username}</p>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-wider">Communication Pro</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#1B2939] border border-[#212E3B] flex items-center justify-center text-[#13a4ec] font-black uppercase">
                                {username.substring(0, 2)}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 mb-10">
                    {/* Historical Performance Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-[#121820] border border-[#212E3B] rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#13a4ec]/5 rounded-full blur-3xl group-hover:bg-[#13a4ec]/10 transition-all"></div>
                        <h3 className="text-lg font-bold text-white mb-10 self-start">Overall Performance</h3>

                        <div className="grid grid-cols-2 gap-8 w-full mb-10">
                            {/* Latest Score */}
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-4">Latest Score</span>
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                                        <motion.circle
                                            cx="56" cy="56" r="48"
                                            stroke="#13a4ec" strokeWidth="6" fill="none"
                                            strokeDasharray="301"
                                            initial={{ strokeDashoffset: 301 }}
                                            animate={{ strokeDashoffset: 301 - (301 * (latestScore / 100)) }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-black text-white">{latestScore || "--"}%</span>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Average */}
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-4">Overall Avg</span>
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="56" cy="56" r="48" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                                        <motion.circle
                                            cx="56" cy="56" r="48"
                                            stroke="#A87FF3" strokeWidth="6" fill="none"
                                            strokeDasharray="301"
                                            initial={{ strokeDashoffset: 301 }}
                                            animate={{ strokeDashoffset: 301 - (301 * (history.length > 0 ? (history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : 0) / 100) }}
                                            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xl font-black text-white">
                                            {history.length > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.score, 0) / history.length) : "--"}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 w-full gap-8 border-t border-[#212E3B]/50 pt-8">
                            <div>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-1">Total Sessions</p>
                                <p className="text-xl font-bold text-[#45EBA5]">{history.length}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-1">Peak Score</p>
                                <p className="text-xl font-bold text-[#13a4ec]">{highestScore}%</p>
                            </div>
                        </div>
                    </motion.div>


                    {/* Metric Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stats.map((stat, idx) => (
                            <motion.div
                                key={stat.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + (idx * 0.1) }}
                                whileHover={{
                                    y: -8,
                                    backgroundColor: "rgba(19, 164, 236, 0.02)",
                                    borderColor: "rgba(19, 164, 236, 0.4)"
                                }}
                                className="bg-[#121820] border border-[#212E3B] rounded-[24px] p-6 flex flex-col justify-between group cursor-default transition-all shadow-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/[0.02] to-transparent rounded-full -mr-12 -mt-12" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <motion.div
                                        whileHover={{ rotate: 15, scale: 1.1 }}
                                        className={`p-2.5 rounded-xl bg-white/5 text-slate-400 group-hover:bg-[#13a4ec]/10 group-hover:text-[#13a4ec] transition-all`}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{idx === 0 ? 'person_voice' : idx === 1 ? 'translate' : idx === 2 ? 'speed' : 'menu_book'}</span>
                                    </motion.div>
                                    <div className="text-right">
                                        <span className={`text-xl font-black text-white group-hover:text-[#13a4ec] transition-colors`}>{stat.score}<span className="text-[10px] text-[#4B6A88] ml-1 font-bold">/100</span></span>
                                        <h4 className="text-[9px] font-black text-white uppercase tracking-widest mt-1 opacity-60">{stat.name}</h4>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.score}%` }}
                                            transition={{ duration: 1.5, delay: 0.5 + (idx * 0.1), ease: [0.34, 1.56, 0.64, 1] }}
                                            style={{ backgroundColor: stat.color }}
                                            className="h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-[#8B9BB4] font-medium leading-relaxed group-hover:text-slate-300 transition-colors">{stat.feedback}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Score Progression & Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Progression Trend</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Performance over time</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#13a4ec] animate-pulse" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Growth View</span>
                            </div>
                        </div>

                        <div className="h-64 w-full relative px-2 pt-10 pb-4">
                            {/* Chart Grid Lines & Y-Axis Labels */}
                            <div className="absolute inset-y-10 left-0 w-full flex flex-col justify-between pointer-events-none z-0">
                                {[100, 75, 50, 25, 0].map(v => (
                                    <div key={v} className="flex items-center w-full gap-4">
                                        <span className="text-[9px] font-bold text-slate-500 w-6 text-right">{v}%</span>
                                        <div className="flex-1 border-t border-white/5" />
                                    </div>
                                ))}
                            </div>

                            <div className="w-full h-full relative z-10 pl-12 pr-8">
                                {loading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-slate-500 italic font-bold text-xs">Generating visual analytics...</p>
                                    </div>
                                ) : history.length === 0 ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <p className="text-slate-500 italic font-bold text-xs">No progression data available yet.</p>
                                    </div>
                                ) : (
                                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                                <stop offset="0%" stopColor="#13a4ec" stopOpacity="0.3" />
                                                <stop offset="100%" stopColor="#13a4ec" stopOpacity="0" />
                                            </linearGradient>
                                            <filter id="glow">
                                                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                <feMerge>
                                                    <feMergeNode in="coloredBlur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Axis Lines */}
                                        <line x1="0" y1="100%" x2="100%" y2="100%" stroke="#212E3B" strokeWidth="1" />
                                        <line x1="0" y1="0" x2="0" y2="100%" stroke="#212E3B" strokeWidth="1" />

                                        {/* Smooth Path Calculation */}
                                        {(() => {
                                            const data = [...history].reverse().slice(-10);
                                            const width = 100; // percent units
                                            const height = 100;

                                            // Handle single point case
                                            if (data.length === 1) {
                                                const p = { x: 50, y: 100 - data[0].score };
                                                return (
                                                    <g className="group/point">
                                                        <motion.circle
                                                            cx="50%"
                                                            cy={p.y + "%"}
                                                            r="6"
                                                            fill="#13a4ec"
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            filter="url(#glow)"
                                                        />
                                                        <foreignObject x="50%" y={p.y + "%"} width="1" height="1" className="overflow-visible pointer-events-none">
                                                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1B2939] border border-[#13a4ec]/30 py-1.5 px-3 rounded-lg opacity-100 transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50">
                                                                <p className="text-[10px] font-black text-white whitespace-nowrap">{data[0].score}%</p>
                                                                <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">{new Date(data[0].date).toLocaleDateString()}</p>
                                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1B2939] rotate-45 border-r border-b border-[#13a4ec]/30" />
                                                            </div>
                                                        </foreignObject>
                                                    </g>
                                                );
                                            }
                                            const points = data.map((h, i) => ({
                                                x: (i / (data.length - 1)) * 100,
                                                y: 100 - h.score
                                            }));

                                            // Area Path
                                            let areaD = `M ${points[0].x} 100 `;
                                            points.forEach((p, i) => {
                                                if (i === 0) areaD += `L ${p.x} ${p.y} `;
                                                else {
                                                    const prev = points[i - 1];
                                                    const cp1x = prev.x + (p.x - prev.x) / 2;
                                                    areaD += `C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y} `;
                                                }
                                            });
                                            areaD += `L ${points[points.length - 1].x} 100 Z`;

                                            // Line Path
                                            let lineD = `M ${points[0].x} ${points[0].y} `;
                                            points.forEach((p, i) => {
                                                if (i > 0) {
                                                    const prev = points[i - 1];
                                                    const cp1x = prev.x + (p.x - prev.x) / 2;
                                                    lineD += `C ${cp1x} ${prev.y}, ${cp1x} ${p.y}, ${p.x} ${p.y} `;
                                                }
                                            });

                                            return (
                                                <>
                                                    <motion.path
                                                        d={areaD}
                                                        fill="url(#trendGradient)"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 1.5 }}
                                                    />
                                                    <motion.path
                                                        d={lineD}
                                                        fill="none"
                                                        stroke="#13a4ec"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 2, ease: "easeInOut" }}
                                                        filter="url(#glow)"
                                                    />
                                                    {points.map((p, i) => (
                                                        <g key={i} className="group/point">
                                                            <motion.circle
                                                                cx={p.x + "%"}
                                                                cy={p.y + "%"}
                                                                r="4"
                                                                fill="#0B0F15"
                                                                stroke="#13a4ec"
                                                                strokeWidth="2"
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 1.5 + (i * 0.1) }}
                                                                className="cursor-pointer transition-all hover:r-6"
                                                            />
                                                            <foreignObject x={p.x + "%"} y={p.y + "%"} width="1" height="1" className="overflow-visible pointer-events-none">
                                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1B2939] border border-[#13a4ec]/30 py-1.5 px-3 rounded-lg opacity-0 group-hover/point:opacity-100 transition-all scale-75 group-hover/point:scale-100 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-50">
                                                                    <p className="text-[10px] font-black text-white whitespace-nowrap">{data[i].score}%</p>
                                                                    <p className="text-[7px] font-bold text-slate-500 uppercase tracking-tighter whitespace-nowrap">{new Date(data[i].date).toLocaleDateString()}</p>
                                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1B2939] rotate-45 border-r border-b border-[#13a4ec]/30" />
                                                                </div>
                                                            </foreignObject>
                                                        </g>
                                                    ))}
                                                </>
                                            );
                                        })()}
                                    </svg>
                                )}
                            </div>

                            {/* X-Axis Labels */}
                            <div className="absolute bottom-1 left-12 right-8 flex justify-between h-4 items-center">
                                {loading || history.length === 0 ? null : (
                                    [...history].reverse().slice(-10).map((h, i) => (
                                        <span key={i} className="text-[8px] font-black text-slate-600 uppercase tracking-tighter w-0 overflow-visible whitespace-nowrap text-center">
                                            {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-[#121820] border border-[#212E3B] p-8 rounded-[32px] flex flex-col justify-center border-l-4 border-l-[#A87FF3] shadow-xl"
                        >
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-[#A87FF3]">psychology</span>
                                Focus Area
                            </h4>
                            <ul className="space-y-4">
                                {[
                                    { tip: 'Improve pitch variation.', icon: 'equalizer' },
                                    { tip: 'Reduce fillers in transitions.', icon: 'timer_off' },
                                    { tip: 'Expand descriptive vocabulary.', icon: 'auto_stories' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[10px] text-slate-400 font-bold hover:text-white transition-colors cursor-default">
                                        <div className="h-1 w-1 rounded-full bg-[#A87FF3]" />
                                        {item.tip}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-[#13a4ec] to-[#13a4ec]/80 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-lg relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>
                            <span className="material-symbols-outlined text-4xl mb-6">workspace_premium</span>
                            <div>
                                <h4 className="text-md font-black uppercase tracking-tight mb-2">Pro Milestone</h4>
                                <p className="text-[11px] font-bold opacity-90 leading-relaxed italic">"Consistency is the key to mastering public presence."</p>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="grid grid-cols-1 mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-8 shadow-xl"
                    >
                        <h4 className="text-md font-bold text-white mb-6 flex items-center gap-3">
                            <span className="material-symbols-outlined text-emerald-500">auto_graph</span>
                            Development Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-emerald-500/20 transition-all">
                                <span className="material-symbols-outlined text-emerald-500 text-2xl">trending_up</span>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Growth Streak</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">Your scores have improved by 8% in the last 3 sessions. Keep the momentum going!</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-[#13a4ec]/20 transition-all">
                                <span className="material-symbols-outlined text-[#13a4ec] text-2xl">speed</span>
                                <div>
                                    <p className="text-sm font-bold text-white mb-1">Pacing Mastery</p>
                                    <p className="text-[10px] text-slate-500 leading-relaxed">You've successfully hit the 140 WPM "Ideal Zone" in 80% of your attempts.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>


                {/* Recent Attempts Table */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-[#121820] border border-[#212E3B] rounded-3xl overflow-hidden shadow-2xl mb-20"
                >
                    <div className="p-8 border-b border-[#212E3B] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white">Session History</h3>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Backend Sync</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-[#212E3B]">
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Date Reported</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Topic</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Overall Score</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">
                                            Syncing with SpeakClear Cloud...
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-20 text-center text-slate-500 font-bold italic">
                                            No sessions recorded yet. Start your first assessment to see results here!
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((attempt, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + (idx * 0.05) }}
                                            className="border-b border-[#212E3B]/50 hover:bg-[#13a4ec]/5 transition-colors group"
                                        >
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-white mb-1">{new Date(attempt.date).toLocaleDateString()}</p>
                                                <p className="text-[10px] font-medium text-[#4B6A88]">{new Date(attempt.date).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-xs font-bold text-[#13a4ec] uppercase tracking-wider">{attempt.topic || "General"}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-black text-white">{attempt.score}</span>
                                                    <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#13a4ec] rounded-full" style={{ width: `${attempt.score}%` }} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[9px] font-black uppercase tracking-wider border border-emerald-500/20">
                                                    Completed
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleViewDetails(attempt)}
                                                        className="text-[#13a4ec] hover:text-white transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/5 px-3 py-2 rounded-lg"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(attempt.id)}
                                                        className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                                                        title="Delete Session"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.section>
            </main>
        </div>
    );
}
