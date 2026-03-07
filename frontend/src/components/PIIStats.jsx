import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const AnimatedCounter = ({ value }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value, 10);
        if (start === end) return;

        let totalDuration = 1500;
        let incrementTime = (totalDuration / end) || 50;

        let timer = setInterval(() => {
            start += 1;
            setCount(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);

        return () => clearInterval(timer);
    }, [value]);

    return <span>{count}</span>;
};

const PIIStats = ({ stats }) => {
    // Expected stats format: { name: 12, phone: 5, aadhaar: 1, email: 3, ... }
    const defaultStats = { name: 0, phone: 0, aadhaar: 0, email: 0, pan: 0, other: 0 };
    const mergedStats = { ...defaultStats, ...stats };

    const items = [
        { label: 'Names', key: 'name', color: 'text-blue-400' },
        { label: 'Phones', key: 'phone', color: 'text-indigo-400' },
        { label: 'Aadhaar', key: 'aadhaar', color: 'text-purple-400' },
        { label: 'Emails', key: 'email', color: 'text-cyan-400' },
        { label: 'PAN cards', key: 'pan', color: 'text-red-400' },
    ];

    return (
        <div className="bg-[#0F172A] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
            {/* Background grid lines */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            <h3 className="text-xl font-bold text-cyan-300 mb-6 font-mono border-b border-cyan-500/30 pb-2">
                THREAT INTELLIGENCE
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
                {items.map((item, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item.key}
                        className="p-4 bg-slate-900/80 rounded-xl border border-slate-700 text-center hover:border-cyan-400/50 transition-colors"
                    >
                        <div className={`text-3xl font-bold ${item.color} font-mono mb-1`}>
                            <AnimatedCounter value={mergedStats[item.key] || 0} />
                        </div>
                        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                            {item.label}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Scanning Laser Effect over the panel */}
            <motion.div
                className="absolute top-0 left-0 h-1 w-full bg-cyan-400/50 shadow-[0_0_10px_#22d3ee]"
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, ease: "linear", repeat: Infinity }}
            />
        </div>
    );
};

export default PIIStats;
