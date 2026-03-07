"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
    username: string;
}

export default function Sidebar({ username }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <>
            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden fixed top-6 right-6 z-50 bg-[#13a4ec]/10 border border-[#13a4ec]/30 p-2 rounded-lg text-[#13a4ec] backdrop-blur-md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
                <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside className={`fixed md:relative w-72 h-full glass-dark border-r border-white/5 flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 z-50 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="space-y-12">
                    <div className="flex items-center gap-4 px-2">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#13a4ec] to-[#13a4ec]/20 flex items-center justify-center text-white border border-white/10 shadow-[0_0_20px_rgba(19,164,236,0.3)]">
                            <span className="material-symbols-outlined text-2xl font-bold">graphic_eq</span>
                        </div>
                        <div>
                            <Link href="/"><h1 className="text-white text-xl font-black tracking-tighter hover:text-[#13a4ec] transition-colors duration-300">SpeakClear</h1></Link>
                            <p className="text-[#13a4ec] text-[9px] font-black uppercase tracking-[0.2em] leading-none mt-1.5 opacity-80">Verbal Clarity AI</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {navItems.map((item, idx) => {
                            const isActive = pathname === item.path;
                            return (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.05 + 0.1 }}
                                >
                                    <Link
                                        href={item.path}
                                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group relative overflow-hidden ${isActive
                                            ? 'text-white font-black'
                                            : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-nav"
                                                className="absolute inset-0 bg-gradient-to-r from-[#13a4ec]/20 to-transparent border-l-2 border-[#13a4ec]"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <div className={`relative z-10 p-1 rounded-lg transition-transform duration-500 ${!isActive && 'group-hover:scale-110'}`}>
                                            <span className={`material-symbols-outlined text-[22px] ${isActive ? 'text-[#13a4ec] text-glow' : 'opacity-70 group-hover:opacity-100 group-hover:text-[#13a4ec]'}`}>{item.icon}</span>
                                        </div>
                                        <span className="relative z-10 text-[13px] tracking-wide uppercase font-bold">{item.name}</span>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>
                </div>

                <div className="space-y-6">
                    {/* User Profile Section */}
                    <div className="px-2 py-6 border-t border-white/5">
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-300 cursor-pointer group">
                            <div className="w-10 h-10 rounded-xl bg-[#13a4ec]/10 flex items-center justify-center text-[#13a4ec] font-black border border-[#13a4ec]/20 group-hover:bg-[#13a4ec] group-hover:text-white transition-all duration-500">
                                {username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-white truncate uppercase tracking-widest">{username}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">Premium Member</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <button className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/5 w-full text-left transition-all duration-300 group">
                            <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all">help</span>
                            <span className="text-xs font-black uppercase tracking-widest">Help Center</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 w-full text-left transition-all duration-300 group"
                        >
                            <span className="material-symbols-outlined text-[20px] opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all">logout</span>
                            <span className="text-xs font-black uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}

