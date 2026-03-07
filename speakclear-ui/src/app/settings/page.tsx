"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { motion } from 'framer-motion';

export default function SettingsPage() {
    const [username, setUsername] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    // New interactive states
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [toast, setToast] = useState<string | null>(null);
    const [prefs, setPrefs] = useState([
        { id: "noise", label: "Automatic Noise Cancellation", sub: "Enhance voice clarity during assessments.", enabled: true },
        { id: "weekly", label: "Weekly Progress Reports", sub: "Receive detailed analytics in your inbox.", enabled: true },
        { id: "dark", label: "Dark Mode Ecosystem", sub: "Optimized for high-contrast visibility.", enabled: true, permanent: true },
    ]);

    const router = useRouter();

    useEffect(() => {
        setIsMounted(true);
        const un = localStorage.getItem("username");
        if (!un) {
            router.push("/login");
        } else {
            setUsername(un);
            setEditName(un);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("username");
        router.push("/login");
    };

    const togglePref = (id: string) => {
        setPrefs(prev => prev.map(p => {
            if (p.id === id && !p.permanent) {
                return { ...p, enabled: !p.enabled };
            }
            if (p.permanent) {
                showToast("System preference cannot be disabled.");
            }
            return p;
        }));
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    const saveProfile = () => {
        if (editName.trim().length < 3) {
            showToast("Name must be at least 3 characters.");
            return;
        }
        localStorage.setItem("username", editName.trim());
        setUsername(editName.trim());
        setIsEditing(false);
        showToast("Profile saved successfully!");
    };

    if (!isMounted || !username) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-[#0B0F15] text-slate-100 font-display">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto pt-24 p-6 md:p-12 relative">
                <header className="mb-12">
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => router.push('/dashboard')}>Dashboard</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Settings</span>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Account Settings</h2>
                    <p className="text-slate-400 mt-2 font-medium">Manage your profile, preferences, and security.</p>
                </header>

                <div className="max-w-4xl space-y-12 mb-20">
                    {/* Profile Section */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-10 shadow-2xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <span className="material-symbols-outlined text-9xl">person</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#13a4ec]">account_circle</span>
                            User Profile
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">DISPLAY NAME</p>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="bg-white/10 border border-[#13a4ec]/50 p-4 rounded-2xl text-white font-bold text-lg w-full focus:outline-none focus:ring-2 focus:ring-[#13a4ec]/30 transition-all"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-white font-bold text-lg">
                                        {username}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">MEMBERSHIP TIER</p>
                                <div className="bg-[#13a4ec]/10 border border-[#13a4ec]/20 p-4 rounded-2xl text-[#13a4ec] font-bold text-lg flex items-center justify-between">
                                    <span>Professional Plan</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-[#13a4ec] text-white px-3 py-1 rounded-full">Active</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">REGISTERED SINCE</p>
                                <p className="text-white font-medium">October 2023</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">EMAIL ADDRESS</p>
                                <p className="text-white font-medium italic opacity-50">alex.rivera@example.com (Protected)</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-10 border-t border-white/5 flex gap-4">
                            {isEditing ? (
                                <>
                                    <button onClick={saveProfile} className="bg-[#45EBA5] hover:bg-[#34D399] text-[#0B0F15] px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#45EBA5]/20 active:scale-95">
                                        Save Changes
                                    </button>
                                    <button onClick={() => { setIsEditing(false); setEditName(username); }} className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-white/5">
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setIsEditing(true)} className="bg-[#13a4ec] hover:bg-[#108CCC] text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-[#13a4ec]/20 active:scale-95">
                                        Edit Profile
                                    </button>
                                    <button onClick={() => showToast("Password reset link sent to registered email.")} className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border border-white/5">
                                        Change Password
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.section>

                    {/* Preferences Section */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[#121820] border border-[#212E3B] rounded-[32px] p-10 shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <span className="material-symbols-outlined text-[#13a4ec]">tune</span>
                            App Preferences
                        </h3>

                        <div className="space-y-6">
                            {prefs.map((pref, i) => (
                                <motion.div
                                    key={pref.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    onClick={() => togglePref(pref.id)}
                                    className={`flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer ${pref.enabled ? 'bg-white/[0.04] border-[#13a4ec]/20 hover:border-[#13a4ec]/40' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'}`}
                                >
                                    <div>
                                        <p className="text-md flex items-center gap-2 font-bold text-white mb-1">
                                            {pref.label}
                                            {pref.permanent && <span className="material-symbols-outlined text-xs text-[#13a4ec]">lock</span>}
                                        </p>
                                        <p className="text-xs text-slate-500 font-medium">{pref.sub}</p>
                                    </div>
                                    <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${pref.enabled ? 'bg-[#13a4ec] shadow-[0_0_15px_rgba(19,164,236,0.3)]' : 'bg-white/10'}`}>
                                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${pref.enabled ? 'right-1' : 'left-1'}`} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Logout & Danger Zone */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="pt-8 flex flex-col items-center gap-10"
                    >
                        <div className="w-full h-px bg-white/5" />

                        <div className="flex gap-6">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 bg-white/5 hover:bg-[#FF5F56]/10 text-slate-400 hover:text-[#FF5F56] px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all border border-white/5 hover:border-[#FF5F56]/30 group"
                            >
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">logout</span>
                                Log Out of Session
                            </button>
                            <button className="flex items-center gap-4 bg-[#FF5F56]/10 text-[#FF5F56] px-10 py-5 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all border border-[#FF5F56]/20 hover:bg-[#FF5F56]/20 group" onClick={() => showToast("Account deletion is restricted in this environment.")}>
                                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">delete_forever</span>
                                Delete Account
                            </button>
                        </div>

                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                            SpeakClear AI v1.0.4 - Production Environment
                        </p>
                    </motion.section>
                </div>
            </main>

            {/* Toast Notification */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-10 right-10 z-50 bg-[#121820] border border-[#13a4ec]/30 shadow-[0_10px_40px_rgba(0,0,0,0.5)] px-6 py-4 rounded-2xl flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-[#13a4ec]">info</span>
                    <p className="text-white font-bold text-sm">{toast}</p>
                </motion.div>
            )}
        </div>
    );
}
