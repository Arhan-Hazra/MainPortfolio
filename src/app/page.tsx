'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import Summary from '@/components/Summary';
import Research from '@/components/Research';
import Projects from '@/components/Projects';
import TechStack from '@/components/TechStack';
import FooterTerminal from '@/components/FooterTerminal';
import BootOverlay from '@/components/circuit/BootOverlay';

// Dynamically import R3F Canvas to prevent SSR hydration mismatch for WebGL
const R3FCanvas = dynamic(() => import('@/components/circuit/R3FCanvas'), {
  ssr: false
});

export default function Home() {
  const [booted, setBooted] = useState<boolean>(false);
  const [shakeState, setShakeState] = useState<'none' | 'slight' | 'intense'>('none');
  const [sandboxViewOnly, setSandboxViewOnly] = useState<boolean>(false);

  return (
    <div
      className={`min-h-screen w-full bg-[#06080a] text-white relative overflow-x-hidden ${
        shakeState === 'slight'
          ? 'shake-slight'
          : shakeState === 'intense'
          ? 'shake-intense'
          : ''
      }`}
    >
      {/* 1. Initial "Boot System" Authorization Overlay */}
      <BootOverlay onBoot={() => setBooted(true)} />

      {/* 2. Full-Screen Heavy Parallax 2D PCB Simulation in React Three Fiber */}
      <R3FCanvas onShake={setShakeState} sandboxViewOnly={sandboxViewOnly} />

      {/* 3. Subtle CRT Scanline Ambience Texture */}
      <div className="fixed inset-0 z-10 crt-overlay pointer-events-none opacity-25" />

      {/* 4. Top Quick Toggle Mode Header (Left Corner) - Ultra-Translucent Glass */}
      <header className="fixed top-4 left-6 z-40 font-mono text-xs pointer-events-auto flex items-center gap-3">
        <button
          onClick={() => setSandboxViewOnly(!sandboxViewOnly)}
          className="px-3 py-1.5 bg-black/15 border border-neon/50 text-neon hover:bg-neon hover:text-black font-bold uppercase transition-all duration-150 rounded-xl backdrop-blur-sm cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(0,255,65,0.2)]"
        >
          {sandboxViewOnly ? '[ SHOW CONTENT OVERLAY ]' : '[ CLEAR VIEW // SANDBOX MODE ]'}
        </button>

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/15 border border-white/15 text-gray-200 rounded-xl backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-neon animate-pulse" />
          <span>SIMULATION: 18-IC FULL-BOARD PCB // R3F PARALLAX</span>
        </div>
      </header>

      {/* 5. Glassmorphism Portfolio Resume Cards (Ultra-Transparent Glass ~10-20% Translucent) */}
      <main
        className={`relative z-20 flex flex-col min-h-screen w-full px-4 md:px-12 py-20 pointer-events-none transition-opacity duration-300 ${
          sandboxViewOnly ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-10">
          {/* Hero Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <Hero />
          </div>

          {/* Summary Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <Summary />
          </div>

          {/* Research Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <Research />
          </div>

          {/* Projects Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <Projects />
          </div>

          {/* TechStack Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <TechStack />
          </div>

          {/* Footer Card - Ultra-Translucent Glass */}
          <div className="glass-content-card pointer-events-auto bg-black/10 backdrop-blur-[2.5px] border border-white/10 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.25),inset_0_1px_1px_rgba(255,255,255,0.06)] overflow-hidden transition-all duration-300 hover:border-white/20">
            <FooterTerminal />
          </div>
        </div>
      </main>
    </div>
  );
}
