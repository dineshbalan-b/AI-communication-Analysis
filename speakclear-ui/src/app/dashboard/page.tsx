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
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white tracking-tight">Score Progression</h3>
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">Last {Math.min(history.length, 10)} sessions</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 bg-[#13a4ec]/10 border border-[#13a4ec]/20 px-3 py-1.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#13a4ec] animate-pulse" />
                                    <span className="text-[9px] font-black text-[#13a4ec] uppercase tracking-widest">Live</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Body */}
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-8 h-8 border-2 border-[#13a4ec]/30 border-t-[#13a4ec] rounded-full animate-spin" />
                                    <p className="text-slate-500 font-bold text-xs">Loading your data...</p>
                                </div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-3">
                                <span className="material-symbols-outlined text-5xl text-slate-700">bar_chart</span>
                                <p className="text-slate-500 font-bold text-xs">Complete a session to see your progress.</p>
                            </div>
                        ) : (() => {
                            const data = [...history].reverse().slice(-10);
                            const W = 620, H = 260, padL = 44, padB = 32, padT = 28, padR = 12;
                            const innerW = W - padL - padR;
                            const innerH = H - padB - padT;
                            const barCount = data.length;
                            const barGap = 10;
                            const barW = (innerW - (barCount - 1) * barGap) / barCount;

                            const getColor = (score: number) => {
                                if (score >= 80) return { top: '#34d399', bot: '#059669', glow: 'rgba(52,211,153,0.25)', text: '#34d399' };
                                if (score >= 60) return { top: '#38bdf8', bot: '#0284c7', glow: 'rgba(56,189,248,0.25)', text: '#38bdf8' };
                                if (score >= 40) return { top: '#fbbf24', bot: '#d97706', glow: 'rgba(251,191,36,0.25)', text: '#fbbf24' };
                                return { top: '#f87171', bot: '#dc2626', glow: 'rgba(248,113,113,0.25)', text: '#f87171' };
                            };

                            const points = data.map((h, i) => ({
                                x: padL + i * (barW + barGap) + barW / 2,
                                y: padT + innerH - (h.score / 100) * innerH,
                                score: h.score,
                                color: getColor(h.score),
                                barH: (h.score / 100) * innerH,
                                barX: padL + i * (barW + barGap),
                            }));

                            // Smooth bezier line
                            let lineD = '';
                            let areaD = '';
                            points.forEach((p, i) => {
                                if (i === 0) {
                                    lineD = `M ${p.x} ${p.y}`;
                                    areaD = `M ${p.x} ${padT + innerH} L ${p.x} ${p.y}`;
                                } else {
                                    const prev = points[i - 1];
                                    const cpX = (prev.x + p.x) / 2;
                                    lineD += ` C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
                                    areaD += ` C ${cpX} ${prev.y}, ${cpX} ${p.y}, ${p.x} ${p.y}`;
                                }
                            });
                            if (points.length >= 1) {
                                areaD += ` L ${points[points.length - 1].x} ${padT + innerH} Z`;
                            }

                            return (
                                <div className="relative w-full">
                                    <svg
                                        viewBox={`0 0 ${W} ${H}`}
                                        className="w-full"
                                        style={{ height: '300px' }}
                                        preserveAspectRatio="xMidYMid meet"
                                    >
                                        <defs>
                                            {data.map((h, i) => {
                                                const c = getColor(h.score);
                                                return (
                                                    <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={c.top} stopOpacity="0.85" />
                                                        <stop offset="100%" stopColor={c.bot} stopOpacity="0.2" />
                                                    </linearGradient>
                                                );
                                            })}
                                            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
                                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                                            </linearGradient>
                                            <filter id="barGlow" x="-30%" y="-30%" width="160%" height="160%">
                                                <feGaussianBlur stdDeviation="4" result="b" />
                                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                                            </filter>
                                            <filter id="lineGlow">
                                                <feGaussianBlur stdDeviation="2.5" result="b" />
                                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                                            </filter>
                                        </defs>

                                        {/* Background subtle grid */}
                                        {[0, 25, 50, 75, 100].map(v => {
                                            const y = padT + innerH - (v / 100) * innerH;
                                            return (
                                                <g key={v}>
                                                    <line
                                                        x1={padL} y1={y} x2={W - padR} y2={y}
                                                        stroke={v === 0 ? '#2A3D52' : '#192534'}
                                                        strokeWidth={v === 0 ? 1.5 : 1}
                                                        strokeDasharray={v === 0 ? '0' : '5 5'}
                                                    />
                                                    <text x={padL - 8} y={y + 4} fill="#3A5470" fontSize="9" textAnchor="end" fontWeight="800" fontFamily="monospace">
                                                        {v}
                                                    </text>
                                                </g>
                                            );
                                        })}

                                        {/* Y-axis label */}
                                        <text x={10} y={padT + innerH / 2} fill="#3A5470" fontSize="8" textAnchor="middle" fontWeight="700" transform={`rotate(-90, 10, ${padT + innerH / 2})`}>SCORE %</text>

                                        {/* Area fill under trend line */}
                                        {points.length >= 2 && (
                                            <motion.path
                                                d={areaD}
                                                fill="url(#areaFill)"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 1.2, delay: 0.9 }}
                                            />
                                        )}

                                        {/* Bars */}
                                        {points.map((p, i) => (
                                            <g key={i}>
                                                {/* Track (background bar) */}
                                                <rect
                                                    x={p.barX} y={padT}
                                                    width={barW} height={innerH}
                                                    rx="7" fill="#0D1822"
                                                />
                                                {/* Glow behind bar */}
                                                <rect
                                                    x={p.barX + 2} y={padT + innerH - p.barH + 2}
                                                    width={barW - 4} height={p.barH}
                                                    rx="6" fill={p.color.glow}
                                                    style={{ filter: 'blur(6px)' }}
                                                />
                                                {/* Main bar */}
                                                <motion.rect
                                                    x={p.barX + 2} y={padT + innerH}
                                                    width={barW - 4} height={0}
                                                    rx="6"
                                                    fill={`url(#bg${i})`}
                                                    animate={{ y: padT + innerH - p.barH, height: p.barH }}
                                                    transition={{ duration: 0.9, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                                                />
                                                {/* Top highlight cap */}
                                                <motion.rect
                                                    x={p.barX + 2} y={padT + innerH}
                                                    width={barW - 4} height={4}
                                                    rx="6"
                                                    fill={p.color.top}
                                                    opacity={0.9}
                                                    animate={{ y: padT + innerH - p.barH, opacity: 0.9 }}
                                                    transition={{ duration: 0.9, delay: i * 0.08, ease: [0.34, 1.56, 0.64, 1] }}
                                                />
                                                {/* Score badge above */}
                                                <motion.g
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.9 + i * 0.08 }}
                                                >
                                                    <rect
                                                        x={p.x - 14} y={p.y - 18}
                                                        width={28} height={14}
                                                        rx="4" fill={p.color.top} opacity={0.15}
                                                    />
                                                    <text x={p.x} y={p.y - 8} textAnchor="middle" fill={p.color.top} fontSize="8.5" fontWeight="900">
                                                        {p.score}%
                                                    </text>
                                                </motion.g>
                                                {/* Date label */}
                                                <text x={p.x} y={H - 6} textAnchor="middle" fill="#3A5470" fontSize="7.5" fontWeight="700">
                                                    {new Date(data[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </text>
                                            </g>
                                        ))}

                                        {/* Trend line glow */}
                                        {points.length >= 2 && (
                                            <motion.path
                                                d={lineD} fill="none"
                                                stroke="#38bdf8" strokeWidth="4"
                                                strokeLinecap="round" strokeLinejoin="round"
                                                opacity={0.2}
                                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.8, delay: 0.8, ease: 'easeInOut' }}
                                            />
                                        )}
                                        {/* Trend line */}
                                        {points.length >= 2 && (
                                            <motion.path
                                                d={lineD} fill="none"
                                                stroke="#38bdf8" strokeWidth="2"
                                                strokeLinecap="round" strokeLinejoin="round"
                                                filter="url(#lineGlow)"
                                                initial={{ pathLength: 0, opacity: 0 }}
                                                animate={{ pathLength: 1, opacity: 1 }}
                                                transition={{ duration: 1.8, delay: 0.8, ease: 'easeInOut' }}
                                            />
                                        )}
                                        {/* Trend dots */}
                                        {points.map((p, i) => (
                                            <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 + i * 0.07, type: 'spring', stiffness: 300 }}>
                                                <circle cx={p.x} cy={p.y} r="5" fill="#0D1822" stroke="#38bdf8" strokeWidth="2" />
                                                <circle cx={p.x} cy={p.y} r="2" fill="#38bdf8" />
                                            </motion.g>
                                        ))}
                                    </svg>

                                    {/* Legend */}
                                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pl-10">
                                        {[
                                            { color: '#34d399', label: 'Excellent', range: '80–100' },
                                            { color: '#38bdf8', label: 'Good', range: '60–79' },
                                            { color: '#fbbf24', label: 'Fair', range: '40–59' },
                                            { color: '#f87171', label: 'Needs Work', range: '<40' },
                                        ].map(l => (
                                            <div key={l.label} className="flex items-center gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color, opacity: 0.85 }} />
                                                <span className="text-[9px] font-bold text-slate-400">{l.label}</span>
                                                <span className="text-[8px] font-medium text-slate-600">({l.range})</span>
                                            </div>
                                        ))}
                                        <div className="flex items-center gap-1.5 ml-2">
                                            <div className="w-5 h-0.5 bg-sky-400 rounded-full" />
                                            <span className="text-[9px] font-bold text-slate-400">Trend</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
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
