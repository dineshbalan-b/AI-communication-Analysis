"use client";

import Link from 'next/link';
import React from 'react';

export default function Footer() {
    return (
        <footer className="w-full bg-[#0D131B] border-t border-[#212E3B] pt-16 pb-8 px-6 mt-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-[#13a4ec] p-1.5 rounded flex items-center justify-center shadow-[0_0_10px_rgba(19,164,236,0.3)]">
                            <span className="material-symbols-outlined text-white text-xl">graphic_eq</span>
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-tight">SpeakClear</h2>
                    </div>
                    <p className="text-[#8B9BB4] text-sm leading-relaxed pr-4 font-medium">
                        Empowering professionals to communicate with clarity, precision, and confidence through AI.
                    </p>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Product</h4>
                    <ul className="space-y-4">
                        {['Features', 'Analysis Tools', 'Pricing Plans'].map(link => (
                            <li key={link}><Link href="#" className="text-[#8B9BB4] hover:text-[#13a4ec] text-sm transition font-medium relative group">
                                {link}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#13a4ec] transition-all group-hover:w-full"></span>
                            </Link></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Resources</h4>
                    <ul className="space-y-4">
                        {['Speech Guide', 'Case Studies', 'Help Center'].map(link => (
                            <li key={link}><Link href="#" className="text-[#8B9BB4] hover:text-[#13a4ec] text-sm transition font-medium relative group">
                                {link}
                                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#13a4ec] transition-all group-hover:w-full"></span>
                            </Link></li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Follow Us</h4>
                    <div className="flex gap-4">
                        {['public', 'alternate_email'].map(icon => (
                            <a href="#" key={icon} className="w-10 h-10 rounded-full bg-[#1B2531] border border-[#2D3F51] flex items-center justify-center text-[#8B9BB4] hover:bg-[#13a4ec] hover:border-[#13a4ec] hover:text-white transition-all hover:-translate-y-1 hover:shadow-[0_5px_15px_rgba(19,164,236,0.3)]">
                                <span className="material-symbols-outlined text-[20px]">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-[#212E3B] flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[#8B9BB4] text-xs font-medium tracking-wide">© 2024 SpeakClear AI. All rights reserved.</p>
                <div className="flex gap-6">
                    <Link href="#" className="text-[#8B9BB4] hover:text-white text-xs font-medium transition">Privacy Policy</Link>
                    <Link href="#" className="text-[#8B9BB4] hover:text-white text-xs font-medium transition">Terms of Service</Link>
                </div>
            </div>
        </footer>
    );
}
