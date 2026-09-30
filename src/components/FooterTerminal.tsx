'use client';

import { useState, useRef, useEffect } from 'react';

const mountainAscii = `
       .
      / \\
     /   \\
    /     \\
   /       \\       .
  /_________\\     / \\
  \\         /    /   \\
   \\       /    /     \\
    \\     /    /_______\\
     \\   /     \\       /
      \\ /       \\     /
       '         \\   /
                  \\ /
                   '
`;

export default function FooterTerminal() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([
    "Terminal OS v2.6.4 (arm64-linux-edge)",
    "Type 'help' or tap a command chip below."
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'hallo' || cmd === 'hello') {
      setOutput((prev) => [...prev, `> ${cmd}`, mountainAscii, "System: Access Granted. Welcome, Operator."]);
    } else if (cmd === 'help') {
      setOutput((prev) => [
        ...prev,
        `> ${cmd}`,
        "AVAILABLE COMMANDS:",
        "  hallo   - Authenticate & display system glyph",
        "  skills  - Output robotics & AI tech stack",
        "  contact - Output direct transmission channels",
        "  clear   - Wipe terminal buffer"
      ]);
    } else if (cmd === 'skills') {
      setOutput((prev) => [
        ...prev,
        `> ${cmd}`,
        "CORE STACK: OpenCV, TensorRT, YOLOv5, CUDA, MediaPipe, C++, Python, Linux, ESP32, Arduino, PCB Design."
      ]);
    } else if (cmd === 'contact') {
      setOutput((prev) => [
        ...prev,
        `> ${cmd}`,
        "EMAIL: hazraarhan@gmail.com",
        "TEL:   +91 6291167210",
        "LOC:   Kolkata / India"
      ]);
    } else if (cmd === 'clear') {
      setOutput([]);
    } else {
      setOutput((prev) => [...prev, `> ${cmd}`, `Command not found: ${cmd}. Type 'help' for options.`]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  return (
    <footer className="p-5 sm:p-8 md:p-16 border-t border-white/20 bg-transparent min-h-[300px] flex flex-col font-mono text-sm pointer-events-auto">
      <div className="flex-grow">
        <div className="mb-6 sm:mb-8">
          <h2 className="font-mono text-neon text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6">
            [ 04 ] CONTACT & SOCIALS
          </h2>
          <h3 className="text-white font-bold text-base sm:text-lg mb-2 uppercase">Arhan Kumar Hazra</h3>
          
          {/* Clickable Email & Phone for mobile dials */}
          <div className="text-xs sm:text-sm text-gray-400 space-y-1">
            <p>
              <a
                href="mailto:hazraarhan@gmail.com"
                className="hover:text-neon underline-offset-4 hover:underline transition-colors"
                title="Send email"
              >
                hazraarhan@gmail.com
              </a>{' '}
              <span className="text-white/20">//</span>{' '}
              <a
                href="tel:+916291167210"
                className="hover:text-neon underline-offset-4 hover:underline transition-colors"
                title="Call phone number"
              >
                +91 6291167210
              </a>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 sm:gap-4 mt-4 text-neon">
            <a
              href="https://linkedin.com/in/arhanhazra"
              target="_blank"
              rel="noreferrer"
              className="min-h-[42px] inline-flex items-center justify-center border border-neon/70 px-4 sm:px-5 py-2 hover:bg-neon hover:text-black transition-colors rounded-lg font-bold text-xs sm:text-sm active:scale-95"
            >
              LINKEDIN ↗
            </a>
            <a
              href="https://github.com/Arhan-Hazra"
              target="_blank"
              rel="noreferrer"
              className="min-h-[42px] inline-flex items-center justify-center border border-neon/70 px-4 sm:px-5 py-2 hover:bg-neon hover:text-black transition-colors rounded-lg font-bold text-xs sm:text-sm active:scale-95"
            >
              GITHUB ↗
            </a>
          </div>
        </div>

        {/* Interactive Terminal Window */}
        <div className="mt-6 sm:mt-8 pt-6 border-t border-white/10 relative">
          <div className="flex items-center justify-between mb-3 text-[10px] sm:text-xs text-gray-500 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
              TERMINAL_SHELL // INTERACTIVE
            </span>
            <span>UTF-8</span>
          </div>

          {/* Quick command buttons for mobile users */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3">
            {['help', 'skills', 'hallo', 'clear'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2.5 py-1 bg-white/5 border border-white/15 hover:border-neon text-gray-300 hover:text-neon text-[10px] sm:text-xs rounded font-mono transition-colors cursor-pointer active:scale-95"
              >
                [{cmd}]
              </button>
            ))}
          </div>

          {/* Output log */}
          <div className="space-y-1.5 mb-3 text-white whitespace-pre font-mono text-xs sm:text-sm overflow-x-auto max-w-full pb-1">
            {output.map((line, i) => (
              <div key={i} className="leading-relaxed">
                {line}
              </div>
            ))}
          </div>

          {/* Command Prompt & Input */}
          <div className="flex items-center gap-2 text-neon bg-black/40 border border-white/15 rounded-lg px-3 py-2 focus-within:border-neon transition-colors">
            <span className="font-bold select-none">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="type 'help' or tap a chip above..."
              className="bg-transparent border-none outline-none flex-grow text-white caret-neon text-base md:text-sm placeholder:text-gray-600"
              spellCheck={false}
              autoComplete="off"
            />
            {input && (
              <button
                onClick={() => executeCommand(input)}
                className="text-xs uppercase bg-neon text-black font-bold px-2 py-0.5 rounded cursor-pointer active:scale-95"
              >
                ENTER
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
