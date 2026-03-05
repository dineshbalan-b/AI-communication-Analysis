"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';

export default function Assessment() {
    const [username, setUsername] = useState("");
    const [topics, setTopics] = useState([
        { name: "Daily Standup Sync", icon: "groups" },
        { name: "Investor Pitch", icon: "trending_up" },
        { name: "Technical Concept Explanation", icon: "terminal" },
        { name: "Conflict Resolution", icon: "psychology" },
        { name: "Casual Networking", icon: "diversity_3" },
        { name: "Project Post-Mortem", icon: "assignment_turned_in" },
    ]);
    const [selectedTopic, setSelectedTopic] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadError, setUploadError] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchTopics = async (force = false) => {
        setRefreshing(true);
        try {
            const resp = await fetch(`http://127.0.0.1:8000/api/topics${force ? "?force=true" : ""}`);
            const data = await resp.json();
            if (data.status === "success") {
                setTopics(data.topics);
            }
        } catch (err) {
            console.error("Failed to fetch topics:", err);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        const un = localStorage.getItem("username");
        if (!un) {
            router.push("/login");
        } else {
            setUsername(un);
            fetchTopics(false);
        }
    }, [router]);

    const methods = [
        {
            id: "upload",
            name: "Upload File",
            icon: "cloud_upload",
            desc: "Support MP3, WAV, MP4 up to 50MB",
            action: "Select File"
        },
        {
            id: "voice",
            name: "Record Voice",
            icon: "mic",
            desc: "Direct audio analysis for best accuracy",
            action: "Start Recording",
            recommended: true
        }
    ];

    useEffect(() => {
        const un = localStorage.getItem("username");
        if (!un) {
            router.push("/login");
        } else {
            setUsername(un);
        }
    }, [router]);

    const handleSubmit = async (file?: File) => {
        const fileToUpload = file || selectedFile;
        if (!fileToUpload || !selectedTopic) {
            setUploadError("Please select a topic and a file first.");
            return;
        }

        setUploadError("");

        const reader = new FileReader();
        reader.readAsDataURL(fileToUpload);
        reader.onloadend = () => {
            sessionStorage.setItem("pending_recording", reader.result as string);
            sessionStorage.setItem("pending_topic", selectedTopic);
            router.push('/assessment/analysis');
        };
    };


    if (!username) return null;


    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display transition-colors duration-500">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto pt-24 md:pt-12 p-6 md:p-12 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-6xl mx-auto"
                >
                    {/* Header */}
                    <header className="mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">Assessment Selection & Setup</h2>
                        <p className="text-[#8B9BB4] font-medium text-lg leading-relaxed max-w-3xl">
                            Choose a topic or start a new session to analyze your verbal clarity and thinking gaps.
                        </p>
                    </header>

                    {/* Generated Topics */}
                    <section className="mb-16">
                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-[#13a4ec]/10 text-[#13a4ec]">
                                    <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                                </div>
                                <h3 className="text-lg font-bold text-white">Generated Topics for Practice</h3>
                            </div>
                            <button
                                onClick={() => fetchTopics(true)}
                                disabled={refreshing}
                                className={`text-[#13a4ec] text-[10px] font-black uppercase tracking-widest hover:underline transition-all ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {refreshing ? 'Refreshing...' : 'Refresh Topics'}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {topics.map((topic, idx) => (
                                <motion.button
                                    key={topic.name}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ y: -4, borderColor: 'rgb(19, 164, 236, 0.4)' }}
                                    onClick={() => setSelectedTopic(topic.name)}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left group ${selectedTopic === topic.name
                                        ? 'bg-[#13a4ec]/10 border-[#13a4ec] shadow-[0_0_25px_rgba(19,164,236,0.15)]'
                                        : 'bg-[#121820] border-[#212E3B] hover:bg-white/[0.02]'
                                        }`}
                                >
                                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${selectedTopic === topic.name ? 'bg-[#13a4ec] text-white shadow-lg shadow-[#13a4ec]/30' : 'bg-white/5 text-slate-400 group-hover:text-white'}`}>
                                        <span className="material-symbols-outlined text-xl">{topic.icon || 'auto_awesome'}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${selectedTopic === topic.name ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{topic.name}</span>
                                </motion.button>
                            ))}
                        </div>

                        {/* Manual Topic Input */}
                        <div className="mt-10 max-w-2xl mx-auto">
                            <div className="flex flex-col gap-4 p-8 bg-[#121820]/60 border border-white/5 rounded-3xl shadow-2xl relative group overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#13a4ec] opacity-40 group-focus-within:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="material-symbols-outlined text-[#13a4ec] text-xl">edit_note</span>
                                    <label className="text-[11px] font-black text-[#4B6A88] uppercase tracking-[0.2em]">Or Enter Topic Manually</label>
                                </div>
                                <input
                                    type="text"
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    placeholder="Type your own topic here... (e.g. My Career Vision)"
                                    className="bg-[#0B0F15] border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-[#13a4ec]/50 transition-all font-bold text-sm"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Start Your Assessment Section */}
                    {uploadError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center flex items-center justify-center gap-3"
                        >
                            <span className="material-symbols-outlined">error</span>
                            {uploadError}
                        </motion.div>
                    )}
                    <section>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="p-2 rounded-lg bg-[#13a4ec]/10 text-[#13a4ec]">
                                <span className="material-symbols-outlined text-2xl">rocket_launch</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Start Your Assessment</h3>
                        </div>

                        <div className="bg-[#121820]/40 border border-[#212E3B] rounded-[40px] p-8 md:p-14 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#13a4ec]/20 to-transparent"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-10 relative z-10">
                                {methods.map((method, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.5 + idx * 0.1 }}
                                        className={`relative group flex flex-col items-center text-center p-10 rounded-[32px] border-2 transition-all cursor-pointer ${method.recommended
                                            ? 'border-[#13a4ec] bg-[#13a4ec]/5 shadow-[0_20px_60px_rgba(19,164,236,0.08)]'
                                            : 'border-[#212E3B] border-dashed bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#13a4ec]/30'
                                            }`}
                                    >
                                        {method.recommended && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#13a4ec] text-[9px] font-black text-white px-5 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-[#13a4ec]/40">
                                                Recommended
                                            </div>
                                        )}

                                        <div className={`h-20 w-20 rounded-full flex items-center justify-center mb-8 transition-all group-hover:scale-110 ${method.recommended ? 'bg-[#13a4ec] text-white shadow-2xl shadow-[#13a4ec]/50' : 'bg-[#1B2939] text-[#13a4ec]'}`}>
                                            <span className="material-symbols-outlined text-4xl">{method.icon}</span>
                                        </div>

                                        <h4 className="text-xl font-bold text-white mb-4">{method.name}</h4>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-10 max-w-[200px]">
                                            {method.desc}
                                        </p>

                                        {method.id === "upload" ? (
                                            <label className="w-full">
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="audio/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            setSelectedFile(file);
                                                            handleSubmit(file);
                                                        }
                                                    }}
                                                />
                                                <div className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl border border-white/5 transition-all text-center">
                                                    {selectedFile ? selectedFile.name : method.action}
                                                </div>
                                            </label>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    if (!selectedTopic) {
                                                        setUploadError("Please select a topic first.");
                                                        return;
                                                    }
                                                    if (method.id === "video") {
                                                        router.push(`/assessment/recording?topic=${encodeURIComponent(selectedTopic)}&type=video`);
                                                    } else {
                                                        router.push(`/assessment/recording?topic=${encodeURIComponent(selectedTopic)}`);
                                                    }
                                                }}

                                                className={`w-full py-4 text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all ${method.recommended ? 'bg-[#13a4ec] hover:bg-[#108CCC] text-white shadow-xl shadow-[#13a4ec]/30 scale-105 hover:scale-110' : 'bg-white/5 border border-white/5 hover:bg-white/10 text-white'}`}
                                            >
                                                {method.action}
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {/* Session Security Info */}
                            <div className="mt-14 flex items-start gap-4 p-7 bg-[#0B0F15]/80 rounded-[28px] border border-white/5 shadow-inner">
                                <div className="h-7 w-7 rounded-full bg-[#13a4ec]/20 flex items-center justify-center shrink-0 border border-[#13a4ec]/30">
                                    <span className="material-symbols-outlined text-[16px] text-[#13a4ec] font-bold">info</span>
                                </div>
                                <p className="text-xs text-slate-400 font-medium leading-loose tracking-wide">
                                    Your session data is encrypted and analyzed locally using our proprietary AI model. We do not store original audio recordings without your explicit consent.
                                </p>
                            </div>
                        </div>
                    </section>


                </motion.div>
            </main>
        </div>
    );
}
