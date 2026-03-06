"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AnalysisPage() {
    const router = useRouter();
    const [progress, setProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const apiCalledRef = useRef(false);

    const statusItems = [
        { id: 1, label: "Uploading Audio...", target: 20 },
        { id: 2, label: "Transcribing Speech...", target: 50 },
        { id: 3, label: "Analyzing Metrics...", target: 75 },
        { id: 4, label: "Generating AI Feedback...", target: 100 },
    ];

    useEffect(() => {
        setIsMounted(true);
        const dataUrl = sessionStorage.getItem("pending_recording");
        const topic = sessionStorage.getItem("pending_topic") || "General Communication";
        const username = localStorage.getItem("username") || "Guest";

        if (!dataUrl && isMounted) {
            setError("No recording found. Please try again.");
            return;
        }

        if (dataUrl && !apiCalledRef.current) {
            apiCalledRef.current = true;
            processAnalysis(dataUrl, topic, username);
        }

        // Visual progress simulation
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 98) {
                    clearInterval(interval);
                    return 98;
                }
                return prev + 0.5;
            });
        }, 200);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted]);

    const processAnalysis = async (dataUrl: string, topic: string, username: string) => {
        try {
            // Convert Data URL to Blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();

            // Detect if it's video or audio
            const isVideo = blob.type.includes('video') || dataUrl.startsWith('data:video');
            const filename = isVideo ? "recording.webm" : "recording.wav";
            const file = new File([blob], filename, { type: blob.type || (isVideo ? 'video/webm' : 'audio/wav') });

            const formData = new FormData();
            formData.append("file", file);
            formData.append("username", username);
            formData.append("topic", topic);

            const apiResponse = await fetch("http://127.0.0.1:8010/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!apiResponse.ok) {
                throw new Error("Failed to process audio on server.");
            }

            const data = await apiResponse.json();

            // Success! Store result and finish progress
            setProgress(100);
            sessionStorage.setItem("last_analysis_result", JSON.stringify(data));

            setTimeout(() => {
                router.push('/assessment/results');
            }, 1000);

        } catch (err: any) {
            console.error("Analysis Error:", err);
            setError(err.message || "An unexpected error occurred during analysis.");
        }
    };

    if (!isMounted) return null;

    const getStatus = (target: number) => {
        if (progress >= target) return { label: "COMPLETED", color: "text-emerald-500", icon: "check_circle" };
        if (progress > target - 25) return { label: "IN PROGRESS", color: "text-[#13a4ec]", icon: "sync" };
        return { label: "PENDING", color: "text-slate-600", icon: "schedule" };
    };

    if (error) {
        return (
            <div className="min-h-screen bg-[#0B1219] text-slate-200 flex flex-col items-center justify-center p-6">
                <div className="bg-red-500/10 border border-red-500/20 p-12 rounded-[40px] max-w-lg w-full text-center">
                    <span className="material-symbols-outlined text-red-500 text-6xl mb-6">error</span>
                    <h2 className="text-2xl font-black mb-4">Analysis Failed</h2>
                    <p className="text-slate-400 mb-8">{error}</p>
                    <button
                        onClick={() => router.push('/assessment')}
                        className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all"
                    >
                        Return to Assessments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1219] text-slate-200 font-sans flex flex-col">
            <nav className="px-12 py-6 flex items-center justify-between border-b border-white/5 bg-[#0B1219]/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#13a4ec] rounded-xl flex items-center justify-center shadow-lg shadow-[#13a4ec]/20">
                        <span className="material-symbols-outlined text-white text-2xl">graphic_eq</span>
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">SpeakClear</span>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full py-20">
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

                <div className="w-full max-w-2xl">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-black text-white uppercase tracking-widest">Overall Analysis Progress</span>
                        <span className="text-xl font-black text-[#13a4ec] tabular-nums">{Math.round(progress)}%</span>
                    </div>

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
                        {progress < 100 ? "Processing your speech patterns..." : "Analysis complete! Finalizing report..."}
                    </p>

                    <div className="space-y-4">
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

                <div className="mt-20">
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
