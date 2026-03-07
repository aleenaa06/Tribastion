import React from 'react';
import { motion } from 'framer-motion';

const CyberBackground = () => {
    // Generate some random particles for the background
    const particles = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
        size: Math.random() * 3 + 1
    }));

    return (
        <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden">
            {/* Glowing Grid Layer */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
                    WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
                }}
            />

            {/* Subtle Vignette / Shadow Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)] opacity-80" />

            {/* Floating Particles */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: ["-10vh", "30vh", "-10vh"],
                        x: ["-5vw", "5vw", "-5vw"],
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default CyberBackground;
