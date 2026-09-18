'use client';

import { motion } from 'framer-motion';

export default function Summary() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 border-b border-white/20">
      <div className="p-8 border-b md:border-b-0 md:border-r border-white/20 flex flex-col justify-between">
        <h2 className="font-mono text-neon text-sm uppercase tracking-widest mb-12">
          [ 01 ] SUMMARY
        </h2>
        <div className="font-mono text-xs text-gray-500 uppercase">
          ID: AKH-2026 // SYSTEM ARCHITECT
        </div>
      </div>
      
      <div className="col-span-2 p-8 md:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-2xl md:text-4xl leading-snug font-light text-gray-300">
            Enthusiastic AI Engineering student with strong expertise in <span className="text-white font-medium">Robotics and Embedded IoT Systems</span>.
          </p>
          <br />
          <p className="text-lg md:text-xl leading-relaxed text-gray-400 font-mono mt-4">
            Experienced in architecting <span className="text-neon">low-latency edge solutions</span> utilizing microcontrollers, custom hardware integration, and <span className="text-white">GPU acceleration</span>. Adept at leveraging real-time computer vision and sensor networks to develop scalable, autonomous robotics.
          </p>
        </motion.div>
        
        {/* Crosshair design element */}
        <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-neon opacity-50" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-neon opacity-50" />
      </div>
    </section>
  );
}
