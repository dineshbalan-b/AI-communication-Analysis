"use client";

import { motion } from 'framer-motion';
import React from 'react';

const features = [
    { icon: "bar_chart", title: "Clarity Score", desc: "Get a real-time score on how effectively you communicate ideas and present information." },
    { icon: "spellcheck", title: "Grammar Analysis", desc: "Detailed breakdown of sentence structure and grammatical flow in spoken conversation." },
    { icon: "mood", title: "Tone Detection", desc: "Understand the emotional impact and professionalism level of your voice automatically." },
    { icon: "mic_none", title: "Filler Tracking", desc: "Identify and reduce 'umms', 'ahhs', and long thinking gaps to sound more confident." }
];

export default function Features() {
    return (
        <section id="features" className="py-24 px-6 w-full flex justify-center bg-[#0D131B] relative border-t border-[#212E3B]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-[#13a4ec]/40 to-transparent"></div>

            <div className="max-w-[1200px] w-full flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20 max-w-2xl"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2531] border border-[#2D3F51] mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-[#8B9BB4]">Capabilities</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Analyze. <span className="text-[#13a4ec]">Improve.</span> Excel.
                    </h2>
                    <p className="text-[#8B9BB4] text-lg font-medium">
                        Our comprehensive toolset provides deep insights into your speech patterns, helping you communicate with maximum impact.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="bg-[#17212B] border border-[#212E3B] rounded-2xl p-8 hover:border-[#13a4ec]/50 transition-colors shadow-lg group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#13a4ec]/5 rounded-bl-full flex -z-10 group-hover:bg-[#13a4ec]/10 transition-colors"></div>
                            <div className="w-14 h-14 bg-[#1B2939] rounded-xl flex items-center justify-center mb-6 border border-[#212E3B] shadow-inner group-hover:shadow-[0_0_15px_rgba(19,164,236,0.3)] group-hover:bg-[#13a4ec]/10 transition-all">
                                <span className="material-symbols-outlined text-[#13a4ec] text-[28px]">{feature.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-[#8B9BB4] text-[15px] leading-relaxed">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
