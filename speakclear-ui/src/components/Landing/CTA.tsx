"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import React from 'react';

export default function CTA() {
    return (
        <section className="py-24 px-6 w-full flex justify-center bg-[#111822]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="max-w-[1000px] w-full bg-gradient-to-br from-[#13a4ec] to-[#0b5f8a] rounded-[2.5rem] p-12 md:p-16 text-center shadow-[0_20px_50px_rgba(19,164,236,0.25)] relative overflow-hidden"
            >
                {/* Decorative blobs inside CTA */}
                <div className="absolute -top-32 -left-32 w-80 h-80 bg-white/20 rounded-full blur-[80px]"></div>
                <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-black/20 rounded-full blur-[80px]"></div>

                {/* Grid Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDcpIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] opacity-50 block mix-blend-overlay pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
                        Ready to speak with<br />total confidence?
                    </h2>
                    <p className="text-white/80 text-lg mb-12 max-w-xl font-medium">
                        Join thousands of leaders who are already improving their communication with SpeakClear.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Link href="/login" className="bg-white text-[#13a4ec] hover:bg-slate-50 px-10 py-4 rounded-xl text-lg font-bold transition-all w-full sm:w-auto shadow-xl hover:-translate-y-1 hover:shadow-2xl">
                            Start Your Free Trial
                        </Link>
                        <button className="bg-[#0b5f8a]/40 backdrop-blur-md hover:bg-[#0b5f8a]/70 text-white border border-white/20 px-10 py-4 rounded-xl text-lg font-bold transition-all w-full sm:w-auto hover:-translate-y-1">
                            Schedule a Demo
                        </button>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
