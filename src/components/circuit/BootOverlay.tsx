'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { circuitAudio } from '@/lib/circuit/audio';

interface BootOverlayProps {
  onBoot: () => void;
}

export default function BootOverlay({ onBoot }: BootOverlayProps) {
  const [booted, setBooted] = useState(false);
  const [logLines, setLogLines] = useState<string[]>([]);

  useEffect(() => {
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
  }, []);

  const handleInitialize = () => {
    circuitAudio.init();
    circuitAudio.playBootSound();
    setBooted(true);
    setTimeout(() => {
      onBoot();
    }, 600);
  };

  if (booted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 text-white font-mono p-6 select-none"
      >
        {/* Background circuit grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

        {/* Central Terminal Box */}
        <div className="relative z-10 w-full max-w-xl border border-white/20 bg-black/80 backdrop-blur-md p-8 md:p-10 shadow-[0_0_50px_rgba(0,255,65,0.15)]">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/20 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-neon animate-pulse" />
              <span className="text-xs text-neon tracking-widest font-bold uppercase">
                SECURITY // AUDIO AUTH GATE
              </span>
            </div>
            <span className="text-xs text-gray-500">REV 2026.09</span>
          </div>

          {/* BIOS Log Terminal */}
          <div className="min-h-[120px] space-y-1.5 text-xs text-gray-400 mb-8 border-l-2 border-neon/40 pl-4">
            {logLines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-neon/80">&gt;</span>
                <span className={idx === logLines.length - 1 ? 'text-white' : ''}>
                  {line}
                </span>
              </div>
            ))}
          </div>

          {/* Core Instruction */}
          <p className="text-xs text-gray-400 mb-8 leading-relaxed">
            Due to modern browser security policies, Web Audio synthesis (electrical spark buzz,
            overload explosions, tactile clicks) requires a single user authorization event.
          </p>

          {/* Action Button */}
          <button
            onClick={handleInitialize}
            className="group relative w-full py-4 px-6 border-2 border-neon bg-black hover:bg-neon text-neon hover:text-black font-mono font-bold tracking-widest uppercase text-sm md:text-base transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:shadow-[0_0_40px_rgba(0,255,65,0.8)] active:translate-y-0.5"
            aria-label="Initialize circuit simulation system"
          >
            <span className="relative flex items-center justify-center gap-3">
              <span className="inline-block w-2 h-2 bg-current animate-ping" />
              [ INITIALIZE SYSTEM // BOOT CANVAS ]
            </span>
          </button>

          <div className="mt-4 flex justify-between items-center text-[10px] text-gray-600">
            <span>PORTFOLIO_OS // ARHAN KUMAR HAZRA</span>
            <span>2D_PHYSICS // RAPID_SIM</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
