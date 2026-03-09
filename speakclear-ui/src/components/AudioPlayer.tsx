"use client";

import React, { useState, useRef, useEffect } from 'react';

export default function AudioPlayer({ src, autoPlay = false, className = "" }: { src: string, autoPlay?: boolean, className?: string }) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (autoPlay === true && audioRef.current) {
            // Browsers might block autoplay, so catch the error silently
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(e => console.warn("Autoplay blocked:", e));
        }
    }, [autoPlay, src]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click in dashboard table
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        const time = Number(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time) || !isFinite(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`flex items-center gap-3 bg-[#121820]/80 border border-white/10 rounded-full py-1.5 px-3 min-w-[240px] shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all hover:bg-white/[0.04] hover:border-[#13a4ec]/30 ${className}`} onClick={(e) => e.stopPropagation()}>
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
            />

            {/* Play/Pause Button */}
            <button
                onClick={togglePlay}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-[#13a4ec]/10 text-[#13a4ec] hover:bg-[#13a4ec] hover:text-white rounded-full transition-all duration-300 shadow-sm border border-[#13a4ec]/20 hover:border-[#13a4ec]/50"
            >
                <span className="material-symbols-outlined text-[18px] ml-[1px]">
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>

            {/* Current Time */}
            <div className="text-[10px] font-bold text-[#13a4ec] tabular-nums tracking-widest w-8 flex-shrink-0 text-right">
                {formatTime(currentTime)}
            </div>

            {/* Progress Bar */}
            <div className="relative flex-1 h-1 bg-[#0B0F15] rounded-full overflow-hidden flex items-center group cursor-pointer border border-white/5" onClick={(e) => e.stopPropagation()}>
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* Track progress */}
                <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#13a4ec]/40 to-[#13a4ec] rounded-full pointer-events-none"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />

                {/* Thumb glow */}
                <div
                    className="absolute h-2.5 w-2.5 bg-white rounded-full shadow-[0_0_8px_rgba(19,164,236,1)] pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${duration ? (currentTime / duration) * 100 : 0}% - 5px)` }}
                />
            </div>

            {/* Duration */}
            <div className="text-[10px] font-bold text-slate-500 tabular-nums tracking-widest w-8 flex-shrink-0">
                {formatTime(duration)}
            </div>

            {/* Visual Analyzer (Static Deco) */}
            <div className={`flex gap-0.5 items-end h-3 ml-1 ${isPlaying ? 'opacity-100' : 'opacity-30'} transition-opacity flex-shrink-0`}>
                <div className={`w-[2px] bg-[#13a4ec]/80 rounded-t-sm ${isPlaying ? 'animate-[pulse_0.8s_ease-in-out_infinite]' : 'h-1.5'}`} style={{ height: isPlaying ? '100%' : '50%' }}></div>
                <div className={`w-[2px] bg-[#13a4ec] rounded-t-sm ${isPlaying ? 'animate-[pulse_1s_ease-in-out_infinite]' : 'h-2'}`} style={{ height: isPlaying ? '70%' : '60%', animationDelay: '0.1s' }}></div>
                <div className={`w-[2px] bg-[#13a4ec]/70 rounded-t-sm ${isPlaying ? 'animate-[pulse_0.9s_ease-in-out_infinite]' : 'h-1'}`} style={{ height: isPlaying ? '40%' : '40%', animationDelay: '0.2s' }}></div>
                <div className={`w-[2px] bg-[#13a4ec]/60 rounded-t-sm ${isPlaying ? 'animate-[pulse_1.2s_ease-in-out_infinite]' : 'h-2.5'}`} style={{ height: isPlaying ? '90%' : '80%', animationDelay: '0.3s' }}></div>
            </div>
        </div>
    );
}
