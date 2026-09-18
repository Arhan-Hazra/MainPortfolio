'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface InspectionData {
  title: string;
  subtitle?: string;
  description?: string;
  status: string;
  auth?: string;
  specs?: string[];
  x?: number;
  y?: number;
  pinCount?: number;
}

interface ComponentTooltipProps {
  data: InspectionData | null;
  onClose: () => void;
}

export default function ComponentTooltip({ data, onClose }: ComponentTooltipProps) {
  if (!data) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] pointer-events-none flex justify-center items-start pt-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: -20 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-black/80 backdrop-blur-2xl border-2 border-neon text-white p-6 rounded-2xl font-mono shadow-[0_0_60px_rgba(0,255,65,0.45),inset_0_0_20px_rgba(0,255,65,0.12)] pointer-events-auto select-none"
        >
          {/* Top Header Bar */}
          <div className="flex items-center justify-between border-b border-neon/40 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neon animate-ping" />
              <span className="text-xs text-neon tracking-widest uppercase font-bold">
                // COMPONENT TELEMETRY READOUT
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-neon text-xs px-3 py-1 rounded-lg border border-white/20 hover:border-neon hover:bg-neon/10 transition-all cursor-pointer font-bold"
              aria-label="Close diagnostic readout"
            >
              [ESC / CLOSE]
            </button>
          </div>

          {/* Title & Subtitle */}
          <div className="mb-3">
            <h4 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">
              {data.title}
            </h4>
            {data.subtitle && (
              <p className="text-xs md:text-sm text-neon/90 mt-1 font-semibold">{data.subtitle}</p>
            )}
          </div>

          {/* Status & Auth Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="inline-block bg-neon/15 border border-neon text-neon px-3 py-1 rounded-md text-xs font-bold tracking-wider">
              {data.status}
            </div>
            {data.auth && (
              <div className="inline-block text-xs text-amber-300 font-bold bg-amber-400/10 border border-amber-400/40 px-3 py-1 rounded-md">
                ★ {data.auth}
              </div>
            )}
            {data.pinCount && (
              <div className="inline-block text-xs text-cyan-300 font-bold bg-cyan-400/10 border border-cyan-400/40 px-3 py-1 rounded-md">
                PACKAGE: {data.pinCount}-PIN DIP
              </div>
            )}
          </div>

          {/* Description */}
          {data.description && (
            <p className="text-xs md:text-sm text-gray-200 leading-relaxed mb-4 border-l-2 border-neon/60 pl-3">
              {data.description}
            </p>
          )}

          {/* Specs List */}
          {data.specs && data.specs.length > 0 && (
            <div className="border-t border-white/15 pt-3 space-y-1.5">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                HARDWARE SPECIFICATIONS:
              </div>
              {data.specs.map((spec, i) => (
                <div key={i} className="text-xs text-gray-300 flex items-center gap-2">
                  <span className="text-neon">&gt;</span>
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
