'use client';

import React from 'react';

interface CircuitHUDProps {
  overloadDuration: number;
  isOverloaded: boolean;
  connectedCount: number;
  totalComponents: number;
  onResetBoard: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function CircuitHUD({
  overloadDuration,
  isOverloaded,
  connectedCount,
  totalComponents,
  onResetBoard,
  isMuted,
  onToggleMute
}: CircuitHUDProps) {
  // Overload progress from 0s to 3.8s
  const overloadProgress = Math.min(100, (overloadDuration / 3.8) * 100);

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-6 z-40 flex flex-col items-end gap-2 font-mono pointer-events-auto select-none">
      {/* 1. Main Telemetry Bar */}
      <div className="p-1.5 sm:p-3 bg-black/85 border border-white/20 text-white rounded-xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-1.5 sm:gap-3 text-xs">
        {/* Connection status */}
        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-white/20">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOverloaded
                ? 'bg-red-500 animate-ping'
                : connectedCount === totalComponents
                ? 'bg-neon animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="text-[10px] sm:text-[11px] text-gray-300">
            <span className="hidden sm:inline">CIRCUIT: </span>
            <span
              className={
                isOverloaded
                  ? 'text-red-400 font-black'
                  : connectedCount === totalComponents
                  ? 'text-neon font-bold'
                  : 'text-amber-400 font-bold'
              }
            >
              {isOverloaded ? 'OVERLOAD' : connectedCount === totalComponents ? 'NOMINAL' : 'DISRUPTED'}
            </span>
          </span>
        </div>

        {/* Component count */}
        <div className="hidden md:block text-[11px] text-gray-300 pr-3 border-r border-white/20">
          ICS SEATED: <span className="text-white font-bold">{connectedCount}/{totalComponents}</span>
        </div>

        {/* Reset Board button */}
        <button
          onClick={onResetBoard}
          className="px-2 sm:px-2.5 py-1 sm:py-1 rounded-md border border-neon/60 hover:border-neon hover:bg-neon hover:text-black text-neon text-[10px] sm:text-[11px] font-bold uppercase transition-all cursor-pointer active:scale-95"
          title="Snap all components back to their sockets"
        >
          <span className="hidden sm:inline">[RESET BOARD]</span>
          <span className="sm:hidden">[RESET]</span>
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={onToggleMute}
          className={`px-2 sm:px-2.5 py-1 sm:py-1 rounded-md border text-[10px] sm:text-[11px] font-bold uppercase transition-colors cursor-pointer active:scale-95 ${
            isMuted
              ? 'border-red-500 text-red-400 hover:bg-red-500 hover:text-black'
              : 'border-white/30 text-gray-300 hover:border-neon hover:text-neon'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
        >
          {isMuted ? (
            <>
              <span className="sm:hidden">OFF</span>
              <span className="hidden sm:inline">AUDIO: OFF</span>
            </>
          ) : (
            <>
              <span className="sm:hidden">AUD</span>
              <span className="hidden sm:inline">AUDIO: ON</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Caution / Overload Thermal Flux Meter (Completely Unobstructed in Top-Right) */}
      {(overloadDuration > 0.05 || isOverloaded) && (
        <div
          className={`p-2.5 sm:p-3.5 rounded-xl border ${
            isOverloaded
              ? 'bg-red-950/90 border-red-500 text-red-400 shadow-[0_0_30px_rgba(255,0,0,0.5)] animate-pulse'
              : overloadDuration >= 2.0
              ? 'bg-black/90 border-red-500/80 text-red-400 shadow-[0_0_25px_rgba(255,50,0,0.4)]'
              : overloadDuration >= 1.0
              ? 'bg-black/90 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(255,180,0,0.3)]'
              : 'bg-black/90 border-neon/50 text-neon shadow-[0_0_15px_rgba(0,255,65,0.2)]'
          } backdrop-blur-xl w-[calc(100vw-1.5rem)] max-w-[280px] sm:w-72 transition-all`}
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold mb-1.5">
            <span className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full bg-current animate-ping shrink-0" />
              <span className="truncate">
                {isOverloaded
                  ? '⚠ OVERLOAD TRIP!'
                  : overloadDuration >= 2.0
                  ? '🔥 THERMAL SMOKE'
                  : overloadDuration >= 1.0
                  ? '⚡ TESLA SIZZLE'
                  : 'CURRENT SENSING'}
              </span>
            </span>
            <span className="shrink-0 text-[10px] sm:text-xs ml-1">{overloadDuration.toFixed(1)}s / 3.8s</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 sm:h-2 rounded-full bg-black/60 border border-white/20 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                isOverloaded
                  ? 'bg-red-500'
                  : overloadDuration >= 2.0
                  ? 'bg-red-500'
                  : overloadDuration >= 1.0
                  ? 'bg-amber-400'
                  : 'bg-neon'
              }`}
              style={{ width: `${overloadProgress}%` }}
            />
          </div>

          <div className="text-[9px] sm:text-[10px] text-gray-400 mt-1 sm:mt-1.5 flex justify-between">
            <span>
              {isOverloaded
                ? 'Reassembly incoming in 2s...'
                : overloadDuration < 1.0
                ? 'Sizzle starts at 1.0s'
                : overloadDuration < 2.0
                ? 'Smoke starts at 2.0s'
                : 'Explosion imminent!'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
