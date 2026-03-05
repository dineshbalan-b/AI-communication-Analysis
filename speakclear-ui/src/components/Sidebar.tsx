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

            <aside className={`fixed md:relative w-72 h-full bg-[#0B0F15] md:bg-[#0B0F15] border-r border-[#212E3B]/30 flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 z-50 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
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
        </>
    );
}

