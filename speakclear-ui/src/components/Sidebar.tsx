"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface SidebarProps {
    username: string;
}

export default function Sidebar({ username }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [clarityRate, setClarityRate] = useState(0);
    const [confidenceRate, setConfidenceRate] = useState(0);

    useEffect(() => {
        if (username) {
            const fetchSidebarStats = async () => {
                try {
                    const resp = await fetch(`http://127.0.0.1:8000/api/progress?username=${username}`);
                    const data = await resp.json();
                    if (data.status === "success" && data.data.length > 0) {
                        const history = data.data;
                        const sumClarity = history.reduce((acc: number, curr: any) => acc + (curr.clarity || 0), 0);
                        const sumConfidence = history.reduce((acc: number, curr: any) => acc + (curr.confidence || 0), 0);

                        setClarityRate(Math.round((sumClarity / history.length) * 10)); // Scale 0-10 to 0-100
                        setConfidenceRate(Math.round((sumConfidence / history.length) * 10));
                    }
                } catch (err) {
                    console.error("Failed to fetch sidebar stats:", err);
                }
            };
            fetchSidebarStats();
        }
    }, [username]);


    const handleLogout = () => {
        localStorage.removeItem("username");
        router.push("/login");
    };

    const navItems = [
        { name: "Dashboard", icon: "grid_view", path: "/dashboard" },
        { name: "Assessments", icon: "mic", path: "/assessment" },
        { name: "History", icon: "history", path: "/history" },
        { name: "Settings", icon: "settings", path: "/settings" },
    ];

    return (
        <aside className="w-72 bg-[#0B0F15] border-r border-[#212E3B]/30 flex flex-col justify-between p-6 shrink-0 transition-all z-10">
            <div className="space-y-10">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-[#13a4ec]/10 flex items-center justify-center text-[#13a4ec] border border-[#13a4ec]/20">
                        <span className="material-symbols-outlined text-2xl font-bold">graphic_eq</span>
                    </div>
                    <div>
                        <Link href="/"><h1 className="text-white text-lg font-bold tracking-tight hover:text-[#13a4ec] transition">SpeakClear</h1></Link>
                        <p className="text-[#13a4ec] text-[10px] font-bold uppercase tracking-widest leading-none mt-1">Verbal Clarity AI</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                    {navItems.map((item, idx) => {
                        const isActive = pathname === item.path;
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 + 0.1 }}
                            >
                                <Link
                                    href={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive
                                        ? 'bg-[#13a4ec] text-white shadow-[0_4px_20px_rgb(19,164,236,0.3)] font-bold'
                                        : 'text-[#8B9BB4] hover:text-white hover:bg-white/5 hover:translate-x-1'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${!isActive && 'group-hover:scale-110 group-hover:text-[#13a4ec]'}`}>{item.icon}</span>
                                    <span className="text-sm">{item.name}</span>
                                </Link>
                            </motion.div>
                        );
                    })}
                </nav>

                {/* Lifetime Scores Section */}
                <div className="pt-8 border-t border-[#212E3B]/30">
                    <p className="text-[10px] font-black text-[#4B6A88] uppercase tracking-[0.2em] mb-6">LIFETIME SCORES</p>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Clarity</span>
                                <span className="text-[#13a4ec]">{clarityRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${clarityRate}%` }} transition={{ duration: 1.5 }} className="h-full bg-[#13a4ec] rounded-full shadow-[0_0_10px_rgba(19,164,236,0.3)]" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">Confidence</span>
                                <span className="text-[#13a4ec]">{confidenceRate}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${confidenceRate}%` }} transition={{ duration: 1.5 }} className="h-full bg-[#13a4ec] rounded-full shadow-[0_0_10px_rgba(19,164,236,0.3)]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#8B9BB4] hover:text-white hover:bg-white/5 w-full text-left transition-all group">
                    <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">help</span>
                    <span className="text-sm font-bold">Help Center</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#8B9BB4] hover:text-[#FF5F56] hover:bg-[#FF5F56]/10 w-full text-left transition-all group"
                >
                    <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">logout</span>
                    <span className="text-sm font-bold">Logout</span>
                </button>
            </div>
        </aside>
    );
}
