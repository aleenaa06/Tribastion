import React from 'react';
import { motion } from 'framer-motion';

const ScanAnimation = ({ isProcessing, fileName }) => {
    if (!isProcessing) return null;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-sm">
            {/* Holographic Glowing Ring */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Outer Ring */}
                <motion.div
                    className="absolute inset-0 rounded-full border border-cyan-400"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Inner Dashed Ring */}
                <motion.div
                    className="absolute inset-4 rounded-full border border-dashed border-cyan-300 opacity-50"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />

                {/* Scanning Vertical Line */}
                <div className="absolute inset-0 overflow-hidden rounded-full">
                    <motion.div
                        className="w-full h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee]"
                        animate={{ y: [0, 256, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </div>

                <div className="z-10 text-cyan-300 text-center font-mono">
                    <span className="text-xl inline-block mb-2">Analyzing Data</span>
                    <br />
                    <span className="text-xs opacity-75">{fileName || 'Document.pdf'}</span>
                </div>
            </div>

            {/* Glowing Progress Bar */}
            <div className="w-64 h-1 mt-8 bg-slate-800 rounded-full overflow-hidden relative shadow-[0_0_10px_#22d3ee]">
                <motion.div
                    className="absolute inset-y-0 left-0 bg-cyan-400"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
            </div>
            <p className="mt-4 text-cyan-400 text-sm font-mono tracking-widest uppercase animate-pulse">
                Detecting PII...
            </p>
        </div>
    );
};

export default ScanAnimation;
