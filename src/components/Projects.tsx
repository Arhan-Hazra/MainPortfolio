'use client';

import { motion } from 'framer-motion';

const projects = [
  {
    title: <a href="https://github.com/Arhan-Hazra/spatial-finger-mouse" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">Spatial Finger Mouse</a>,
    status: "Completed",
    date: "06/2026 – 07/2026",
    description: "Developed a touchless cursor control system utilizing OpenCV and MediaPipe for real-time spatial hand tracking. Translated complex hand gestures into precise mouse actions, demonstrating low-latency edge AI perception."
  },
  {
    title: "The Autonomous Pet Robot",
    status: "In Progress",
    date: "04/2025 – Present",
    description: "Architecting a custom autonomous robotics platform by engineering a repurposed HP Pavilion G6 motherboard to interface with a dedicated GTX 1050 Ti GPU. Designing the system architecture for high-performance, on-device edge AI processing to enable real-time perception and autonomous navigation."
  },
  {
    title: <a href="https://github.com/Arhan-Hazra/No-App-Smart-Home-ESP8266" target="_blank" rel="noreferrer" className="hover:underline hover:text-white">No-App Smart Home Automation</a>,
    status: "Completed",
    date: "04/2025 – 05/2025",
    description: "Engineered an independent local smart home system using an ESP8266 microcontroller. Designed a custom web interface hosted directly on the edge device, eliminating the need for third-party mobile applications and improving response times."
  }
];

export default function Projects() {
  return (
    <section className="border-b border-white/20">
      <div className="p-5 sm:p-8 border-b border-white/20 flex items-center justify-between">
        <h2 className="font-mono text-neon text-xs sm:text-sm uppercase tracking-widest">
          [ 03 ] PROJECTS / PROTOTYPES
        </h2>
        <span className="font-mono text-[10px] sm:text-xs text-gray-500">HARDWARE & EDGE AI</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3">
        {projects.map((project, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            className={`group p-5 sm:p-8 border-b md:border-b-0 ${
              index !== projects.length - 1 ? 'md:border-r' : ''
            } border-white/20 md:hover:bg-neon md:hover:text-black active:border-neon active:bg-white/5 transition-all duration-300 md:cursor-crosshair flex flex-col justify-between min-h-0 sm:min-h-[360px] md:min-h-[420px] gap-6`}
          >
            <div>
              <div className="flex justify-between items-start mb-4 sm:mb-6 font-mono text-[11px] sm:text-xs border-b border-white/20 md:group-hover:border-black/20 pb-3 sm:pb-4">
                <span className="md:group-hover:text-black/70 text-gray-400">{project.date}</span>
                <span
                  className={
                    project.status === 'Completed'
                      ? 'text-neon md:group-hover:text-black font-bold'
                      : 'text-yellow-500 md:group-hover:text-black'
                  }
                >
                  [{project.status.toUpperCase()}]
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 uppercase leading-tight tracking-tight text-white md:group-hover:text-black">
                {project.title}
              </h3>
            </div>

            <p className="font-mono text-xs sm:text-sm leading-relaxed text-gray-400 md:group-hover:text-black/80">
              {project.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
