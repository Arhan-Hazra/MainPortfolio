'use client';

import { motion } from 'framer-motion';

export default function Summary() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 border-b border-white/20">
      <div className="p-5 sm:p-8 border-b md:border-b-0 md:border-r border-white/20 flex flex-row md:flex-col justify-between items-center md:items-start gap-3">
        <h2 className="font-mono text-neon text-xs sm:text-sm uppercase tracking-widest md:mb-12">
          [ 01 ] SUMMARY
        </h2>
        <div className="font-mono text-[10px] sm:text-xs text-gray-500 uppercase">
          ID: AKH-2026 // SYSTEM ARCHITECT
        </div>
      </div>
      
      <div className="col-span-2 p-5 sm:p-8 md:p-16 relative">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl sm:text-2xl md:text-4xl leading-snug font-light text-gray-200">
            Enthusiastic AI Engineering student with strong expertise in <span className="text-white font-medium">Robotics and Embedded IoT Systems</span>.
          </p>
          <p className="text-sm sm:text-base md:text-xl leading-relaxed text-gray-400 font-mono mt-3 sm:mt-5">
            Experienced in architecting <span className="text-neon">low-latency edge solutions</span> utilizing microcontrollers, custom hardware integration, and <span className="text-white">GPU acceleration</span>. Adept at leveraging real-time computer vision and sensor networks to develop scalable, autonomous robotics.
          </p>
        </motion.div>
        
        {/* Crosshair design element */}
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 border-t border-r border-neon opacity-50" />
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 border-b border-r border-neon opacity-50" />
      </div>
    </section>
  );
}
