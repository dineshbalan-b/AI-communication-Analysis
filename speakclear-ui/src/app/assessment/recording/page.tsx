"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

function RecordingPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || 'The Impact of Remote Work on Team Collaboration';
    const isVideo = searchParams.get('type') === 'video';

    const [seconds, setSeconds] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [username, setUsername] = useState("");

    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(10));
    const [showMicError, setShowMicError] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);


    useEffect(() => {
        setIsMounted(true);
        const storedUser = localStorage.getItem("username");
        if (storedUser) {
            setUsername(storedUser);
            startMicrophone();
        } else {
            router.push("/login");
        }

        return () => {
            stopMicrophone();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const startMicrophone = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: isVideo
            });
            streamRef.current = stream;

            if (isVideo && videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Setup Audio Context for visualization
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256;

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            // Setup MediaRecorder
            const mimeType = isVideo ? 'video/webm' : 'audio/wav';
            // Fallback for Safari which doesn't support video/webm easily in MediaRecorder without codecs
            const options = MediaRecorder.isTypeSupported(mimeType) ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const finalMime = mediaRecorder.mimeType || (isVideo ? 'video/webm' : 'audio/wav');
                const blob = new Blob(audioChunksRef.current, { type: finalMime });

                // Store the file in a custom window object or session storage as a data URL for now
                // (In a real app, you might use a state management library)
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    sessionStorage.setItem("pending_recording", reader.result as string);
                    sessionStorage.setItem("pending_topic", topic);
                    router.push('/assessment/analysis');
                };
            };

            mediaRecorder.start();
            setIsRecording(true);
            visualize();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setShowMicError(true);
        }
    };

    const stopMicrophone = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };

    const visualize = () => {
        if (!analyserRef.current) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const update = () => {
            if (isPaused) {
                animationFrameRef.current = requestAnimationFrame(update);
                return;
            }

            analyserRef.current?.getByteFrequencyData(dataArray);

            // Map frequencies to 40 bars
            const newLevels = [];
            const step = Math.floor(bufferLength / 40);
            for (let i = 0; i < 40; i++) {
                const value = dataArray[i * step] || 10;
                // Normalize value (0-255) to a height percentage (10-100)
                const height = Math.max(10, (value / 255) * 100);
                newLevels.push(height);
            }
            setAudioLevels(newLevels);
            animationFrameRef.current = requestAnimationFrame(update);
        };

        update();
    };

    const handlePauseToggle = () => {
        if (isPaused) {
            mediaRecorderRef.current?.resume();
        } else {
            mediaRecorderRef.current?.pause();
        }
        setIsPaused(!isPaused);
    };

    const handleFinish = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
    };

    const handleDiscard = () => {
        if (mediaRecorderRef.current) {
            // Remove the onstop handler so it doesn't trigger the analysis redirect
            mediaRecorderRef.current.onstop = null;
            if (mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        }
        router.push('/assessment');
    };

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isPaused && isMounted && isRecording) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPaused, isMounted, isRecording]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!isMounted) return null;

    return (
        <div className="flex h-screen bg-[#0B0F15] text-slate-200 overflow-hidden font-sans">
            <Sidebar username={username} />

            <main className="flex-1 overflow-y-auto relative flex flex-col">
                <div className="pt-24 md:pt-8 px-6 md:px-12 pb-6 md:pb-8 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-white/5 gap-4 md:gap-0">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-black uppercase tracking-widest">
                        <span className="hover:text-[#13a4ec] cursor-pointer transition-colors" onClick={() => router.push('/assessment')}>Assessments</span>
                        <span className="material-symbols-outlined text-sm opacity-30">chevron_right</span>
                        <span className="text-slate-300">Live Recording</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
                            <motion.div
                                animate={{ opacity: isPaused ? 0.3 : [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"
                            />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{isPaused ? 'Paused' : 'Live'}</span>
                        </div>
                        <div className="w-10 h-10 rounded-full border-2 border-white/5 p-0.5">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#13a4ec]/20 to-slate-800 flex items-center justify-center text-[10px] font-black text-[#13a4ec]">
                                {username?.substring(0, 2).toUpperCase() || "JD"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-5xl mx-auto w-full px-6 md:px-12 pt-10 md:pt-16 pb-48 md:pb-32 flex flex-col items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <span className="text-[11px] font-black text-[#13a4ec] uppercase tracking-[0.3em] mb-4 block">Current Topic</span>
                        <h1 className="text-4xl font-black text-white mb-6 tracking-tight leading-tight max-w-2xl mx-auto">
                            {topic}
                        </h1>
                        <p className="text-slate-500 font-medium text-base">
                            Focus on maintaining a steady pace and minimizing filler words like "um" or "ah".
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`w-full bg-[#121820]/40 border border-white/5 rounded-[40px] p-8 md:p-16 mb-16 relative overflow-hidden group shadow-2xl ${isVideo ? 'flex items-center justify-center min-h-[400px]' : ''}`}
                    >
                        <div className="absolute top-8 right-12 flex items-center gap-3 z-10">
                            <span className="text-2xl font-black text-[#13a4ec] tracking-tighter tabular-nums">{formatTime(seconds)}</span>
                            <span className="material-symbols-outlined text-[#13a4ec] text-xl">timer</span>
                        </div>

                        {isVideo ? (
                            <div className="w-full h-full max-w-3xl rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg relative">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted
                                    playsInline
                                    className={`w-full h-full object-cover ${isPaused ? 'opacity-50 grayscale' : ''} transition-all duration-300`}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-1.5 h-48">
                                {audioLevels.map((height, i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            height: height === 10 ? 4 : height,
                                            opacity: isPaused ? 0.2 : 1
                                        }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 300,
                                            damping: 20
                                        }}
                                        className="w-1.5 rounded-full bg-gradient-to-t from-[#13a4ec] to-[#0ea5e9]/40"
                                    />
                                ))}
                            </div>
                        )}
                    </motion.div>

                    <div className="flex items-center justify-center gap-16">
                        <div className="flex flex-col items-center gap-4 group">
                            <button
                                onClick={handlePauseToggle}
                                className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center text-white hover:border-[#13a4ec] hover:bg-[#13a4ec]/10 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl">{isPaused ? 'play_arrow' : 'pause'}</span>
                            </button>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-[#13a4ec] transition-colors">
                                {isPaused ? 'Resume' : 'Pause'}
                            </span>
                        </div>

                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={handleFinish}
                                className="w-24 h-24 rounded-full bg-[#13a4ec] shadow-2xl shadow-[#13a4ec]/40 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all duration-500 group relative"
                            >
                                {!isPaused && (
                                    <motion.div
                                        animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.4, 0.2] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-full bg-[#13a4ec] blur-xl"
                                    />
                                )}
                                <span className="material-symbols-outlined text-4xl relative z-10 font-bold">stop</span>
                            </button>
                            <span className="text-[11px] font-black text-[#13a4ec] uppercase tracking-[0.2em]">Finish Assessment</span>
                        </div>

                        <div className="flex flex-col items-center gap-4 group">
                            <button
                                onClick={handleDiscard}
                                className="w-16 h-16 rounded-full border-2 border-white/10 flex items-center justify-center text-white hover:border-red-500/50 hover:bg-red-500/10 transition-all duration-300"
                            >
                                <span className="material-symbols-outlined text-2xl text-red-500/80">close</span>
                            </button>
                            <span className="text-[10px] font-black text-red-500/50 uppercase tracking-widest group-hover:text-red-500 transition-colors">Discard</span>
                        </div>
                    </div>
                </div>

                <div className="fixed bottom-0 left-0 md:left-72 right-0 py-6 md:py-8 px-6 md:px-12 border-t border-white/5 bg-[#0B0F15]/90 backdrop-blur-2xl z-20">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0">
                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mic Status</span>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs font-black tracking-widest uppercase ${isRecording ? 'text-emerald-500' : 'text-slate-500'}`}>
                                    {isRecording ? 'Capturing Audio' : 'Initializing...'}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Thinking Gaps</span>
                            <div className="flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[#13a4ec] text-lg">location_on</span>
                                <span className="text-sm font-black text-white tracking-widest uppercase">Live Tracking Enabled</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Pace (WPM)</span>
                            <div className="flex items-center justify-end gap-2">
                                <span className="material-symbols-outlined text-amber-500 text-lg">speed</span>
                                <span className="text-sm font-black text-white tracking-widest">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mic Error Modal */}
                {showMicError && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0F15]/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            className="bg-[#121820] border border-white/5 p-8 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.6)] max-w-md w-full relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full blur-[40px] pointer-events-none" />

                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                    <span className="material-symbols-outlined text-2xl">mic_off</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Microphone Access Needed</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#8B9BB4] mt-1">Permission Required</p>
                                </div>
                            </div>

                            <p className="text-sm text-slate-400 font-medium leading-relaxed mb-8 relative z-10">
                                <span className="text-white font-bold">Microphone access is required</span> for this assessment to evaluate your communication skills. Please grant microphone permissions in your browser and try again.
                            </p>

                            <div className="flex items-center justify-end gap-3 relative z-10">
                                <button
                                    onClick={() => {
                                        setShowMicError(false);
                                        router.push('/dashboard');
                                    }}
                                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-300 bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] hover:text-white transition-all"
                                >
                                    Return to Dashboard
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMicError(false);
                                        startMicrophone();
                                    }}
                                    className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest text-[#13a4ec] bg-[#13a4ec]/10 hover:bg-[#13a4ec]/20 border border-[#13a4ec]/30 transition-all flex items-center gap-2 group/btn"
                                >
                                    <span className="material-symbols-outlined text-[16px] group-hover/btn:scale-110 transition-transform">refresh</span>
                                    Try Again
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}

export default function RecordingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0B0F15] flex items-center justify-center text-white">Loading...</div>}>
            <RecordingPageContent />
        </Suspense>
    );
}
