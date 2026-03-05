"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const toggleMode = () => {
        setErrorMsg("");
        setMode(prev => prev === "login" ? "register" : "login");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");
        setIsLoading(true);

        const endpoint = mode === "login" ? "http://127.0.0.1:8000/api/login" : "http://127.0.0.1:8000/api/register";
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (!response.ok) {
                setErrorMsg(data.detail || "An error occurred.");
            } else {
                localStorage.setItem("username", username);
                router.push("/dashboard");
            }
        } catch (err) {
            setErrorMsg("Network error. Make sure FastAPI server is running on port 8000.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#0B0F15] text-slate-100 font-display selection:bg-[#00A3FF]/30 selection:text-white">
            {/* Premium Header */}
            <header className="flex items-center justify-between px-6 md:px-12 py-6 z-50">
                <div className="flex items-center gap-3 group cursor-pointer">
                    <motion.div
                        whileHover={{ rotate: 180 }}
                        className="h-10 w-10 bg-[#00A3FF] rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,163,255,0.3)]"
                    >
                        <span className="material-symbols-outlined text-2xl">graphic_eq</span>
                    </motion.div>
                    <Link href="/"><h1 className="text-white text-xl font-bold tracking-tight">SpeakClear</h1></Link>
                </div>

                <nav className="hidden md:flex items-center gap-10">
                    {["About", "Features", "Pricing"].map((item) => (
                        <Link key={item} href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">
                            {item}
                        </Link>
                    ))}
                    <button
                        onClick={() => setMode("register")}
                        className="bg-[#00A3FF] hover:bg-[#0081CC] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-[0_4px_14px_rgba(0,163,255,0.39)] transition-all active:scale-95"
                    >
                        Sign Up
                    </button>
                </nav>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 relative">
                {/* Dynamic Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.1, 0.15, 0.1],
                            x: [0, 50, 0],
                            y: [0, -30, 0]
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#00A3FF]/20 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.05, 0.1, 0.05],
                            x: [0, -40, 0],
                            y: [0, 60, 0]
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-[#00A3FF]/10 rounded-full blur-[150px]"
                    />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full max-w-[460px] relative z-10"
                    >
                        <div className="bg-[#121820]/80 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 md:p-12 shadow-[0_22px_70px_8px_rgba(0,0,0,0.56)]">

                            <div className="text-center mb-10">
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl font-bold text-white mb-3"
                                >
                                    {mode === "login" ? "Welcome Back" : "Create Account"}
                                </motion.h2>
                                <p className="text-slate-400 text-sm font-medium">
                                    {mode === "login"
                                        ? "Sign in to continue your verbal analysis journey."
                                        : "Start analyzing your verbal clarity today."}
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="space-y-2"
                                >
                                    <label className="text-xs font-bold text-white uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={e => setUsername(e.target.value)}
                                        className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-[#00A3FF] px-5 text-white transition-all outline-none placeholder:text-slate-600"
                                        placeholder="name@company.com"
                                        required
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-2"
                                >
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-xs font-bold text-white uppercase tracking-wider">Password</label>
                                        {mode === "login" && (
                                            <Link href="#" className="text-[11px] font-bold text-[#00A3FF] hover:text-[#0081CC] transition-colors">
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 focus:bg-white/10 focus:border-[#00A3FF] px-5 pr-12 text-white transition-all outline-none placeholder:text-slate-600"
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-xl">
                                                {showPassword ? 'visibility_off' : 'visibility'}
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-14 bg-[#00A3FF] hover:bg-[#0081CC] text-white font-bold rounded-2xl shadow-[0_4px_24px_rgba(0,163,255,0.4)] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <span className="material-symbols-outlined animate-spin">sync</span>
                                    ) : (
                                        mode === "login" ? "Sign In" : "Sign Up"
                                    )}
                                </motion.button>

                                {errorMsg && (
                                    <motion.p
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-red-400 text-xs font-medium text-center"
                                    >
                                        {errorMsg}
                                    </motion.p>
                                )}
                            </form>

                            <div className="my-8 flex items-center gap-4">
                                <div className="h-px flex-1 bg-white/5"></div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">or continue with</span>
                                <div className="h-px flex-1 bg-white/5"></div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button className="group h-14 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-bold text-xs">
                                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="Google" />
                                    Google
                                </button>
                                <button className="group h-14 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 font-bold text-xs">
                                    <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" className="w-5 h-5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="LinkedIn" />
                                    LinkedIn
                                </button>
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-slate-400 text-sm font-medium">
                                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        onClick={toggleMode}
                                        className="text-[#00A3FF] font-bold hover:underline transition-all"
                                    >
                                        {mode === "login" ? "Sign up for free" : "Sign in"}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <footer className="py-10 text-center space-y-4">
                <p className="text-slate-500 text-[11px] font-medium">
                    © 2024 SpeakClear Analysis Systems. All rights reserved.
                </p>
                <div className="flex justify-center gap-6">
                    <Link href="#" className="text-slate-500 hover:text-white text-[11px] font-medium transition-colors">Privacy Policy</Link>
                    <Link href="#" className="text-slate-500 hover:text-white text-[11px] font-medium transition-colors">Terms of Service</Link>
                </div>
            </footer>
        </div>
    );
}
