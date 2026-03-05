"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

const AudioWave = ({ color = "#13a4ec" }: { color?: string }) => (
    <div className="flex items-end gap-1 h-5">
        {[1, 2, 3, 4, 5].map((i) => (
            <motion.div
                key={i}
                animate={{
                    height: ["20%", "100%", "30%", "80%", "20%"]
                }}
                transition={{
                    duration: 1.2 + (i * 0.1),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.1
                }}
                className="w-1 rounded-full"
                style={{ backgroundColor: color }}
            />
        ))}
    </div>
);

export default function Dashboard() {
    const [username, setUsername] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [latestScore, setLatestScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [highestScore, setHighestScore] = useState(0);
    const [sessionToDelete, setSessionToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
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

    const handleDelete = (sessionId: number) => {
        setSessionToDelete(sessionId);
    };

    const confirmDelete = async () => {
        if (!sessionToDelete) return;
        setIsDeleting(true);

        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/session/${sessionToDelete}`, {
                method: 'DELETE'
            });
            const data = await resp.json();
            if (data.status === "success") {
                // Refresh history
                fetchHistory(username);
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        } finally {
            setIsDeleting(false);
            setSessionToDelete(null);
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

    const containerVariants: any = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants: any = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 20
            }
        }
    };

    const pulseVariants: any = {
        initial: { scale: 1, opacity: 0.4 },
        animate: {
            scale: [1, 1.5, 1],
            opacity: [0.4, 0.8, 0.4],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
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
            color: "#13a4ec",
            icon: "mic",
            bgIcon: "graphic_eq"
        },
        {
            name: "Grammar",
            score: average("grammar"),
            feedback: average("grammar") >= 80 ? "Strong syntactic control." : "Focus on sentence structure.",
            color: "#FFBD2E",
            icon: "forum",
            bgIcon: "chat_bubble"
        },
        {
            name: "Confidence",
            score: average("confidence"),
            feedback: average("confidence") >= 80 ? "Confident delivery." : "Work on your vocal presence.",
            color: "#45EBA5",
            icon: "record_voice_over",
            bgIcon: "mic_none"
        },
        {
            name: "Vocabulary",
            score: average("vocabulary"),
            feedback: average("vocabulary") >= 80 ? "Rich word choice." : "Try using more varied synonyms.",
            color: "#A87FF3",
            icon: "keyboard_voice",
            bgIcon: "volume_up"
        },
    ];

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto pt-24 p-6 md:p-10 relative">
                <motion.header
                    initial="hidden"
                    animate="visible"
                    variants={itemVariants}
                    className="flex justify-between items-center mb-10 lg:mb-14"
                >
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">Dashboard</h2>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-3 border-l border-[#212E3B] pl-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white leading-tight">{username}</p>
                                <motion.p
                                    animate={{ opacity: [0.6, 1, 0.6] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-wider"
                                >
                                    Communication Pro
                                </motion.p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#1B2939] border border-[#212E3B] flex items-center justify-center text-[#13a4ec] font-black uppercase">
                                {username.substring(0, 2)}
                            </div>
                        </div>
                    </div>
                </motion.header>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-8 mb-10"
                >
                    {/* Historical Performance Card */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2, transition: { duration: 0.3, ease: "easeOut" } }}
                        className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.4)]"
                    >
                        {/* Soft background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#13a4ec]/5 rounded-full blur-[100px] group-hover:bg-[#13a4ec]/10 transition-all duration-700"></div>
                        <h3 className="text-lg font-bold text-white tracking-tight mb-10 self-start">Overall Performance</h3>

                        <div className="grid grid-cols-2 gap-8 w-full mb-10 relative z-10">
                            {/* Latest Score */}
                            <div className="flex flex-col items-center justify-center relative">
                                <motion.div
                                    animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 border border-[#13a4ec]/20 rounded-full"
                                />
                                <span className="text-[10px] font-bold text-[#4B6A88] uppercase tracking-widest mb-4">Latest Score</span>
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full -rotate-90 relative z-10">
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

                        <div className="grid grid-cols-2 w-full gap-8 border-t border-white/5 pt-8 relative z-10">
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
                                variants={itemVariants}
                                whileHover={{
                                    y: -4,
                                    scale: 1.01,
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                    boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.3)"
                                }}
                                className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-3xl p-6 flex flex-col justify-between group cursor-default transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.2)] relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full -mr-16 -mt-16" />

                                {/* Communication Visual Watermark */}
                                <span className="material-symbols-outlined absolute -bottom-6 -right-4 text-[120px] opacity-[0.02] rotate-[-15deg] group-hover:scale-105 group-hover:rotate-0 group-hover:opacity-[0.04] transition-all duration-700 blur-[2px]">
                                    {stat.bgIcon}
                                </span>

                                <div className="flex justify-between items-start mb-4 relative z-10 gap-4">
                                    <motion.div
                                        whileHover={{ rotate: 10, scale: 1.05 }}
                                        className="p-3 rounded-2xl bg-white/[0.03] text-slate-400 group-hover:bg-white/[0.06] transition-all border border-white/5"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
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
                </motion.div >

                {/* Score Progression & Insights Section */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 mb-10"
                >
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] overflow-hidden relative"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#13a4ec]/[0.015] rounded-full blur-[120px] pointer-events-none"></div>
                        {/* Card Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
                            <div>
                                <h3 className="text-xl font-bold text-white tracking-tight">Performance Analytics</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1 relative inline-flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#13a4ec]/40" />
                                    Continuous Skill Tracking
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</span>
                                    <span className="text-[11px] font-bold text-[#13a4ec] mt-1 flex items-center gap-2">
                                        <AudioWave color="#13a4ec" />
                                        Live Feed
                                    </span>
                                </div>
                                <div className="w-10 h-10 rounded-2xl bg-[#13a4ec]/5 border border-[#13a4ec]/10 flex items-center justify-center text-[#13a4ec]">
                                    <span className="material-symbols-outlined text-xl">insights</span>
                                </div>
                            </div>
                        </div>

                        {/* Chart Body */}
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 border-2 border-[#13a4ec]/10 rounded-full" />
                                        <div className="absolute inset-0 border-2 border-t-[#13a4ec] rounded-full animate-spin" />
                                    </div>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Initializing Data Stream...</p>
                                </div>
                            </div>
                        ) : history.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-[#212E3B] rounded-[24px]">
                                <div className="w-16 h-16 rounded-full bg-[#13a4ec]/5 flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-3xl text-slate-700">query_stats</span>
                                </div>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Analytics Available</p>
                                <p className="text-slate-600 text-[10px] mt-1">Complete your first session to begin tracking.</p>
                            </div>
                        ) : (() => {
                            const data = [...history].reverse().slice(-12);
                            const avgScore = data.reduce((acc, h) => acc + h.score, 0) / data.length;

                            const W = 620, H = 280, padL = 40, padB = 40, padT = 30, padR = 10;
                            const innerW = W - padL - padR;
                            const innerH = H - padB - padT;

                            const xSpacing = innerW / (data.length - 1 || 1);

                            const getColor = (score: number) => {
                                if (score >= 80) return { main: '#34d399', bg: 'rgba(52,211,153,0.1)' };
                                if (score >= 60) return { main: '#38bdf8', bg: 'rgba(56,189,248,0.1)' };
                                if (score >= 40) return { main: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
                                return { main: '#f87171', bg: 'rgba(248,113,113,0.1)' };
                            };

                            const points = data.map((h, i) => ({
                                x: padL + i * xSpacing,
                                y: padT + innerH - (h.score / 100) * innerH,
                                score: h.score,
                                color: getColor(h.score),
                            }));

                            const avgY = padT + innerH - (avgScore / 100) * innerH;

                            // Professional Spline Logic
                            const getPath = (pts: typeof points, type: 'area' | 'line') => {
                                let d = `M ${pts[0].x} ${pts[0].y}`;
                                pts.forEach((p, i) => {
                                    if (i === 0) return;
                                    const prev = pts[i - 1];
                                    const cx = (prev.x + p.x) / 2;
                                    d += ` C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
                                });
                                if (type === 'area') {
                                    d += ` L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;
                                }
                                return d;
                            };

                            return (
                                <div className="relative w-full">
                                    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: '320px' }} preserveAspectRatio="xMidYMid meet">
                                        <defs>
                                            <linearGradient id="splineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#13a4ec" stopOpacity="0.25" />
                                                <stop offset="100%" stopColor="#13a4ec" stopOpacity="0" />
                                            </linearGradient>
                                            <filter id="pointGlow">
                                                <feGaussianBlur stdDeviation="3" result="blur" />
                                                <feMerge>
                                                    <feMergeNode in="blur" />
                                                    <feMergeNode in="SourceGraphic" />
                                                </feMerge>
                                            </filter>
                                        </defs>

                                        {/* Grid Matrix */}
                                        {[0, 20, 40, 60, 80, 100].map((v, i) => {
                                            const y = padT + innerH - (v / 100) * innerH;
                                            return (
                                                <g key={v}>
                                                    <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={v === 0 ? '#212E3B' : '#161F29'} strokeWidth={v === 0 ? 2 : 1} />
                                                    <text x={padL - 10} y={y + 3} fill="#4B6A88" fontSize="8" fontWeight="800" textAnchor="end" fontFamily="monospace">{v}</text>
                                                </g>
                                            );
                                        })}

                                        {/* Average Line */}
                                        <g opacity="0.3">
                                            <line x1={padL} y1={avgY} x2={W - padR} y2={avgY} stroke="#13a4ec" strokeWidth="1" strokeDasharray="6 4" />
                                            <text x={W - padR - 5} y={avgY - 5} fill="#13a4ec" fontSize="7" fontWeight="900" textAnchor="end" style={{ textTransform: 'uppercase' }}>Average Score: {avgScore.toFixed(0)}%</text>
                                        </g>

                                        {/* Spline Area Fill */}
                                        <motion.path
                                            d={getPath(points, 'area')}
                                            fill="url(#splineAreaGrad)"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 1 }}
                                        />

                                        {/* Spline Line */}
                                        <motion.path
                                            d={getPath(points, 'line')}
                                            fill="none"
                                            stroke="#13a4ec"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, ease: "easeInOut" }}
                                        />

                                        {/* Data Nodes & Tooltip Pills */}
                                        {points.map((p, i) => (
                                            <g key={i}>
                                                {/* Connecting line to axis */}
                                                <line x1={p.x} y1={p.y} x2={p.x} y2={padT + innerH} stroke="#13a4ec" strokeWidth="1" strokeDasharray="4 4" opacity="0.1" />

                                                {/* Node */}
                                                <motion.circle
                                                    cx={p.x} cy={p.y} r="5"
                                                    fill="#121820" stroke={p.color.main} strokeWidth="2.5"
                                                    filter="url(#pointGlow)"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 1 + i * 0.05, type: "spring" }}
                                                />

                                                {/* Floating Score Pill */}
                                                <motion.g
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.5 + i * 0.05 }}
                                                >
                                                    <rect x={p.x - 14} y={p.y - 25} width={28} height={14} rx="7" fill={p.color.main} />
                                                    <text x={p.x} y={p.y - 15} textAnchor="middle" fill="#121820" fontSize="8" fontWeight="900">{p.score}%</text>
                                                </motion.g>

                                                {/* Date Label on Axis */}
                                                <text x={p.x} y={H - 15} textAnchor="middle" fill="#4B6A88" fontSize="7" fontWeight="800" transform={`rotate(0, ${p.x}, ${H - 15})`}>
                                                    {new Date(data[i].date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </text>
                                            </g>
                                        ))}
                                    </svg>

                                    {/* Professional Legend */}
                                    <div className="flex items-center justify-between mt-4 px-6 sm:px-10 border-t border-white/5 pt-6 relative z-10 flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex -space-x-1.5">
                                                    {['#34d399', '#38bdf8', '#fbbf24', '#f87171'].map(c => (
                                                        <div key={c} className="w-2.5 h-2.5 rounded-full border-2 border-[#0B0F15]" style={{ backgroundColor: c }} />
                                                    ))}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline-block">Skill Tiers</span>
                                            </div>
                                            <div className="w-px h-4 bg-white/10 hidden sm:block"></div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#13a4ec] to-transparent" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest hidden sm:inline-block">Trajectory</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 bg-white/[0.03] rounded-lg border border-white/5">
                                            <span className="text-[8px] font-bold text-slate-400/80 uppercase tracking-[0.2em] hidden sm:inline-block">Efficiency Range</span>
                                            <span className="text-[10px] font-black text-white">40-100%</span>
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
                            className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] flex flex-col justify-center border-l-2 border-l-[#A87FF3]/50 shadow-[0_8px_30px_rgb(0,0,0,0.2)] backdrop-blur-md relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A87FF3]/5 rounded-bl-full blur-2xl"></div>
                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                <span className="material-symbols-outlined text-sm text-[#A87FF3]">psychology</span>
                                Focus Area
                            </h4>
                            <ul className="space-y-4 relative z-10">
                                {[
                                    { tip: 'Improve pitch variation.', icon: 'equalizer' },
                                    { tip: 'Reduce fillers in transitions.', icon: 'timer_off' },
                                    { tip: 'Expand descriptive vocabulary.', icon: 'auto_stories' }
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-[11px] text-slate-400 font-medium hover:text-white transition-colors cursor-default">
                                        <div className="h-1 w-1 rounded-full bg-[#A87FF3]/60" />
                                        {item.tip}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-[#13a4ec] to-[#0ea5e9] p-8 rounded-[32px] text-white flex flex-col justify-between shadow-[0_8px_30px_rgba(19,164,236,0.3)] relative overflow-hidden group"
                        >
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-3xl"></div>

                            <span className="material-symbols-outlined absolute -bottom-6 -right-6 text-[120px] opacity-[0.15] rotate-[-15deg] mix-blend-overlay group-hover:scale-110 transition-transform duration-700 blur-[2px]">
                                settings_voice
                            </span>

                            <div className="flex items-center justify-between mb-6 relative z-10">
                                <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                                <div className="opacity-80 scale-75">
                                    <AudioWave color="#ffffff" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h4 className="text-md font-black uppercase tracking-tight mb-2">Pro Milestone</h4>
                                <p className="text-[11px] font-bold opacity-90 leading-relaxed italic">"Consistency is the key to mastering public presence."</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid grid-cols-1 mb-20"
                >
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -2, transition: { duration: 0.3 } }}
                        className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] relative overflow-hidden group"
                    >
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-[100px] pointer-events-none group-hover:bg-emerald-500/[0.04] transition-all duration-700"></div>
                        <h4 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3 relative z-10">
                            <span className="material-symbols-outlined text-emerald-500 p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">auto_graph</span>
                            Development Insights
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.04] transition-all duration-300">
                                <span className="material-symbols-outlined text-emerald-500 text-2xl mt-1">trending_up</span>
                                <div>
                                    <p className="text-base font-bold text-white mb-2 tracking-tight">Growth Streak</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">Your scores have improved by 8% in the last 3 sessions. Keep the momentum going!</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-[#13a4ec]/30 hover:bg-white/[0.04] transition-all duration-300">
                                <span className="material-symbols-outlined text-[#13a4ec] text-2xl mt-1">speed</span>
                                <div>
                                    <p className="text-base font-bold text-white mb-2 tracking-tight">Pacing Mastery</p>
                                    <p className="text-xs text-slate-400 leading-relaxed font-medium">You've successfully hit the 140 WPM "Ideal Zone" in 80% of your attempts.</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>


                {/* Recent Attempts Table */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/[0.02] border border-white/5 backdrop-blur-2xl rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] mb-20"
                >
                    <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <h3 className="text-xl font-bold text-white tracking-tight">Session History</h3>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-full w-fit">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Sync</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-8 py-5 text-[10px] font-black text-[#8B9BB4] uppercase tracking-widest whitespace-nowrap">Date Reported</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#8B9BB4] uppercase tracking-widest whitespace-nowrap">Topic</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#8B9BB4] uppercase tracking-widest whitespace-nowrap">Overall Score</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#8B9BB4] uppercase tracking-widest whitespace-nowrap">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-[#8B9BB4] uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center text-slate-400 font-medium">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <AudioWave color="#4B6A88" />
                                                <span className="text-xs uppercase tracking-widest">Syncing with SpeakClear Cloud...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-32 text-center text-slate-400">
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <span className="material-symbols-outlined text-4xl opacity-50">data_usage</span>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-white">No sessions recorded yet.</p>
                                                    <p className="text-xs font-medium">Start your first assessment to see results here!</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((attempt, idx) => (
                                        <motion.tr
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.6 + (idx * 0.05) }}
                                            className="border-b border-white/5 hover:bg-white/[0.02] transition-colors duration-300 group"
                                        >
                                            <td className="px-8 py-6 whitespace-nowrap">
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
                                                <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-500/20 shadow-sm">
                                                    Completed
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleViewDetails(attempt)}
                                                        className="text-[#13a4ec] hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/[0.03] border border-white/5 hover:bg-[#13a4ec] hover:border-[#13a4ec] px-4 py-2.5 rounded-xl shadow-sm hover:shadow-[0_4px_14px_rgba(19,164,236,0.4)]"
                                                    >
                                                        <span className="material-symbols-outlined text-[16px]">insert_chart</span>
                                                        View Data
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(attempt.id)}
                                                        className="text-slate-400 hover:text-red-400 transition-all p-2.5 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
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

                {/* Delete Confirmation Modal */}
                {sessionToDelete !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F15]/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-[#121820] border border-white/5 p-8 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-w-md w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-bl-full blur-[40px] pointer-events-none" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                    <span className="material-symbols-outlined text-2xl">warning</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Delete Session</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B9BB4] mt-1">Irreversible Action</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                                Are you sure you want to <span className="text-white font-bold">permanently delete</span> this recorded session? All associated audio, transcripts, and analysis data will be lost.
                            </p>

                            <div className="flex items-center justify-end gap-3 relative z-10">
                                <button
                                    onClick={() => setSessionToDelete(null)}
                                    disabled={isDeleting}
                                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-300 bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-white bg-red-500 hover:bg-red-400 border border-red-500/50 shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                                >
                                    {isDeleting ? (
                                        <>
                                            <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">delete_forever</span>
                                            Delete Permanently
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
