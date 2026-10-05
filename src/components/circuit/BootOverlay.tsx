'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { circuitAudio } from '@/lib/circuit/audio';

interface BootOverlayProps {
  onBoot: () => void;
}

export default function BootOverlay({ onBoot }: BootOverlayProps) {
  const [booted, setBooted] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

  useEffect(() => {
    // If user already booted in this session, skip overlay immediately
    if (typeof window !== 'undefined' && sessionStorage.getItem('portfolio_booted') === 'true') {
      setBooted(true);
      onBoot();
      return;
    }

    const sequence = [
      'SYS_CORE // ANTIGRAVITY EXPERIMENTAL ARCHITECTURE',
      'INITIALIZING 2D RIGID-BODY KINEMATICS ENGINE...',
      'CIRCUIT TRACE NETWORK: 4 NODES ONLINE',
      'AUDIO SUBSYSTEM: WAITING FOR USER INPUT...',
      'STATUS: READY TO BOOT'
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < sequence.length) {
        setLogLines((prev) => [...prev, sequence[current]]);
        current++;
      } else {
        clearInterval(interval);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [onBoot]);

  const isInitializingRef = useRef(false);

  const handleInitialize = (e?: React.SyntheticEvent) => {
    if (isInitializingRef.current || booted) return;
    isInitializingRef.current = true;
    e?.preventDefault();
    e?.stopPropagation();

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('portfolio_booted', 'true');
      } catch {
        // Ignore quota/private mode errors
      }
    }

    circuitAudio.init();
    circuitAudio.playBootSound();
    setBooted(true);
    setTimeout(() => {
      onBoot();
    }, 600);
  };

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          key="boot-overlay"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(12px)', scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] w-screen h-screen min-h-[100dvh] flex flex-col items-center justify-center bg-black/95 text-white font-mono p-4 sm:p-6 select-none pointer-events-auto touch-manipulation"
        >
          {/* Background circuit grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

          {/* Central Terminal Box */}
          <div className="relative z-10 w-full max-w-xl border border-white/20 bg-black/90 backdrop-blur-xl p-5 sm:p-8 md:p-10 shadow-[0_0_60px_rgba(0,255,65,0.2)] rounded-xl sm:rounded-2xl">
            {/* Header Bar */}
            <div className="flex items-center justify-between border-b border-white/20 pb-3 sm:pb-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-neon animate-pulse" />
                <span className="text-[11px] sm:text-xs text-neon tracking-wider sm:tracking-widest font-bold uppercase">
                  SECURITY // AUDIO AUTH GATE
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-gray-500">REV 2026.09</span>
            </div>

            {/* BIOS Log Terminal */}
            <div className="min-h-[100px] sm:min-h-[120px] space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs text-gray-400 mb-6 sm:mb-8 border-l-2 border-neon/40 pl-3 sm:pl-4 overflow-x-hidden">
              {logLines.map((line, idx) => (
                <div key={idx} className="flex items-center gap-1.5 sm:gap-2 truncate">
                  <span className="text-neon/80 shrink-0">&gt;</span>
                  <span className={`truncate ${idx === logLines.length - 1 ? "text-white" : ""}`}>

                    {line}
                  </span>
                </div>
              ))}
            </div>

            {/* Core Instruction */}
            <p className="text-[11px] sm:text-xs text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              Due to browser security policies, Web Audio synthesis (electrical spark buzz,
              overload explosions, tactile clicks) requires a user authorization gesture.
            </p>

            {/* Action Button */}
            <button
              onClick={handleInitialize}
              type="button"
              className="group relative w-full py-3.5 sm:py-4 px-4 sm:px-6 border-2 border-neon bg-black hover:bg-neon text-neon hover:text-black font-mono font-bold tracking-wider sm:tracking-widest uppercase text-xs sm:text-sm md:text-base transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_40px_rgba(0,255,65,0.8)] active:translate-y-0.5 rounded-lg sm:rounded-none touch-manipulation"
              aria-label="Initialize circuit simulation system"
            >
              <span className="relative flex items-center justify-center gap-2 sm:gap-3">
                <span className="inline-block w-2 h-2 bg-current animate-ping" />
                <span className="sm:hidden">[ INITIALIZE // BOOT SYSTEM ]</span>
                <span className="hidden sm:inline">[ INITIALIZE SYSTEM // BOOT CANVAS ]</span>
              </span>
            </button>

            <div className="mt-4 flex justify-between items-center text-[9px] sm:text-[10px] text-gray-600">
              <span>PORTFOLIO_OS // ARHAN KUMAR HAZRA</span>
              <span>2D_PHYSICS // RAPID_SIM</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
