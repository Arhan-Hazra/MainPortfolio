'use client';

import { motion } from 'framer-motion';

const publications = [
  {
    id: "JSA-D-26-01394",
    title: "Repurposing Mobile Hardware to Outperform Traditional SBCs",
    authors: "Arhan Kumar Hazra (primary), Ajit Kumar Pasayat",
    status: "Under Review - Submitted to Journal of Systems Architecture",
    description: "Investigated repurposing legacy smartphone hardware as a sustainable, high-performance Linux server alternative to traditional single-board computers, complete with integrated GPIO functionality."
  },
  {
    id: "IN-PREP-01",
    title: "The Portable Task Companion: Memory-Safe and Context-Aware Task Tracking on Resource-Constrained Microcontrollers",
    authors: "Arhan Kumar Hazra (primary), Anish Kumar Pandey",
    status: "In Preparation",
    description: "Developing a highly efficient, memory-safe task tracking architecture optimized specifically for deployment on resource-constrained edge devices and microcontrollers."
  }
];

export default function Research() {
  return (
    <section className="border-b border-white/20">
      <div className="grid grid-cols-1 md:grid-cols-4 border-b border-white/20">
        <div className="p-8 md:col-span-1 border-b md:border-b-0 md:border-r border-white/20">
          <h2 className="font-mono text-neon text-sm uppercase tracking-widest mb-4">
            [ 02 ] RESEARCH & PUB
          </h2>
          <p className="font-mono text-xs text-gray-500">ACADEMIC LOGS</p>
        </div>
        
        <div className="md:col-span-3">
          {publications.map((pub, index) => (
            <motion.div 
              key={pub.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`p-8 md:p-12 hover:bg-white/5 transition-colors duration-300 ${index !== publications.length - 1 ? 'border-b border-white/20' : ''}`}
            >
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-6">
                <h3 className="text-xl md:text-2xl font-medium max-w-2xl">{pub.title}</h3>
                <span className="font-mono text-xs px-2 py-1 border border-neon text-neon shrink-0">
                  REF: {pub.id}
                </span>
              </div>
              
              <div className="font-mono text-sm space-y-2 mb-6">
                <p><span className="text-gray-500">AUTHORS //</span> {pub.authors}</p>
                <p><span className="text-gray-500">STATUS //</span> <span className="text-white">{pub.status}</span></p>
              </div>
              
              <p className="text-gray-400 font-mono text-sm leading-relaxed border-l-2 border-white/20 pl-4">
                {pub.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
