"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function HistoryPage() {
    const [username, setUsername] = useState("");
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
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
            const resp = await fetch(`http://127.0.0.1:8010/api/progress?username=${user}`);
            const data = await resp.json();
            if (data.status === "success") {
                setHistory(data.data); // Backend already sorts DESC
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
            const resp = await fetch(`http://127.0.0.1:8010/api/session/${sessionId}`, {
                method: 'DELETE'
            });
            const data = await resp.json();
            if (data.status === "success") {
                fetchHistory(username);
                setSelectedIds(prev => prev.filter(id => id !== sessionId));
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} sessions?`)) return;

        setIsBulkDeleting(true);
        try {
            const resp = await fetch(`http://127.0.0.1:8010/api/sessions/bulk-delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedIds })
            });
            const data = await resp.json();
            if (data.status === "success") {
                fetchHistory(username);
                setSelectedIds([]);
            }
        } catch (err) {
            console.error("Failed to bulk delete sessions:", err);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === history.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(history.map(h => h.id));
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

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto pt-24 p-6 md:p-12 relative">
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Session History</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-4xl font-black text-white tracking-tight">Full Session History</h2>
                            <p className="text-slate-400 mt-2 font-medium">Review and analyze all your past communication assessments.</p>
                        </div>
                        {selectedIds.length > 0 && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={handleBulkDelete}
                                disabled={isBulkDeleting}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.length} Selected`}
                            </motion.button>
                        )}
                    </div>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#121820] border border-[#212E3B] rounded-[32px] overflow-hidden shadow-2xl"
                >
                    <div className="p-8 border-b border-[#212E3B] flex justify-between items-center bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-[#13a4ec]">history</span>
                            <h3 className="text-lg font-bold text-white">All Attempts ({history.length})</h3>
                        </div>
                        {history.length > 0 && (
                            <button
                                onClick={toggleSelectAll}
                                className="text-[10px] font-black uppercase tracking-widest text-[#4B6A88] hover:text-white transition-colors"
                            >
                                {selectedIds.length === history.length ? "Deselect All" : "Select All"}
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-[#212E3B] bg-white/[0.02]">
                                    <th className="px-10 py-6 w-16">
                                        <div
                                            onClick={toggleSelectAll}
                                            className={`w-5 h-5 rounded border-2 transition-all cursor-pointer flex items-center justify-center ${selectedIds.length > 0
                                                    ? 'bg-[#13a4ec] border-[#13a4ec]'
                                                    : 'border-[#212E3B] hover:border-slate-500'
                                                }`}
                                        >
                                            {selectedIds.length > 0 && (
                                                <span className="material-symbols-outlined text-white text-sm font-bold">
                                                    {selectedIds.length === history.length ? 'check' : 'remove'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="px-6 py-6 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Date & Time</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Assessment Topic</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Score</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest">Performance</th>
                                    <th className="px-10 py-6 text-[10px] font-black text-[#4B6A88] uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#212E3B]/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-12 h-12 border-4 border-[#13a4ec]/20 border-t-[#13a4ec] rounded-full animate-spin" />
                                                <p className="text-slate-500 font-bold italic">Loading your history...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : history.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-10 py-32 text-center text-slate-500 font-bold italic">
                                            No sessions found. Start a new assessment to begin your journey.
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((attempt, idx) => (
                                        <motion.tr
                                            key={attempt.id || idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 + (idx * 0.05) }}
                                            className={`hover:bg-[#13a4ec]/5 transition-all group border-b border-[#212E3B]/50 ${selectedIds.includes(attempt.id) ? 'bg-[#13a4ec]/10' : ''
                                                }`}
                                        >
                                            <td className="px-10 py-8">
                                                <div
                                                    onClick={() => toggleSelect(attempt.id)}
                                                    className={`w-5 h-5 rounded border-2 transition-all cursor-pointer flex items-center justify-center ${selectedIds.includes(attempt.id)
                                                            ? 'bg-[#13a4ec] border-[#13a4ec]'
                                                            : 'border-[#212E3B] group-hover:border-slate-500'
                                                        }`}
                                                >
                                                    {selectedIds.includes(attempt.id) && (
                                                        <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-8">
                                                <p className="text-md font-bold text-white mb-1">
                                                    {new Date(attempt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                <p className="text-xs font-medium text-[#4B6A88]">{new Date(attempt.date).toLocaleTimeString()}</p>
                                            </td>
                                            <td className="px-10 py-8 text-[#13a4ec] font-black uppercase text-xs tracking-widest">
                                                {attempt.topic || "General Practice"}
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-2xl font-black text-white tabular-nums">{attempt.score}</span>
                                                    <div className="flex-1 w-24 h-1.5 bg-white/5 rounded-full overflow-hidden hidden md:block">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${attempt.score}%` }}
                                                            className="h-full bg-[#13a4ec] shadow-[0_0_10px_rgba(19,164,236,0.3)]"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-xs font-black uppercase tracking-wider">
                                                <span className={`px-4 py-1.5 rounded-full border ${attempt.score >= 80
                                                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                                    : attempt.score >= 60
                                                        ? 'bg-[#13a4ec]/10 text-[#13a4ec] border-[#13a4ec]/20'
                                                        : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                                    }`}>
                                                    {attempt.score >= 80 ? 'Mastery' : attempt.score >= 60 ? 'Proficient' : 'Developing'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleViewDetails(attempt)}
                                                        className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95"
                                                    >
                                                        Details
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(attempt.id)}
                                                        className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                        title="Delete Session"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">delete</span>
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
