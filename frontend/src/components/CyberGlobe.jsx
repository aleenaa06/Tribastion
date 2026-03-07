import React, { useEffect, useRef } from 'react';

export default function CyberGlobe() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        const cx = W / 2;
        const cy = H / 2;
        const R = 160;

        const dots = Array.from({ length: 60 }, () => ({
            lat: (Math.random() - 0.5) * Math.PI,
            lng: Math.random() * Math.PI * 2,
            r: Math.random() * 2.5 + 1,
            color: ['#22d3ee', '#0ea5e9', '#06b6d4'][Math.floor(Math.random() * 3)],
            speed: (Math.random() - 0.5) * 0.002,
        }));

        let angle = 0;
        let animId;

        function drawFrame() {
            ctx.clearRect(0, 0, W, H);
            angle += 0.003;

            const grad = ctx.createRadialGradient(cx - 40, cy - 40, 20, cx, cy, R);
            grad.addColorStop(0, 'rgba(6,182,212,0.18)');
            grad.addColorStop(0.6, 'rgba(6,182,212,0.06)');
            grad.addColorStop(1, 'rgba(6,182,212,0.02)');

            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(34, 211, 238, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            for (let lat = -3; lat <= 3; lat++) {
                const y = cy + (lat / 3) * R * 0.85;
                const halfW = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)));
                ctx.beginPath();
                ctx.ellipse(cx, y, halfW, halfW * 0.22, 0, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(34,211,238,0.12)';
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            for (let i = 0; i < 6; i++) {
                const a = angle + (i / 6) * Math.PI;
                ctx.beginPath();
                ctx.ellipse(cx, cy, R * Math.abs(Math.cos(a)), R, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(34,211,238,${0.05 + 0.08 * Math.abs(Math.cos(a))})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }

            dots.forEach(dot => {
                dot.lng += 0.004 + dot.speed;
                const lngRotated = dot.lng + angle;
                const x3d = R * Math.cos(dot.lat) * Math.sin(lngRotated);
                const y3d = R * Math.sin(dot.lat);
                const z3d = R * Math.cos(dot.lat) * Math.cos(lngRotated);

                if (z3d < 0) return;

                const px = cx + x3d;
                const py = cy + y3d;
                const brightness = 0.3 + 0.7 * (z3d / R);

                ctx.beginPath();
                ctx.arc(px, py, dot.r * brightness, 0, Math.PI * 2);
                ctx.fillStyle = dot.color;
                ctx.globalAlpha = brightness * 0.9;
                ctx.fill();
                ctx.globalAlpha = 1;
            });

            animId = requestAnimationFrame(drawFrame);
        }

        drawFrame();
        return () => cancelAnimationFrame(animId);
    }, []);

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px] relative pointer-events-none">
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
            </div>
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="relative z-10 opacity-90 mix-blend-screen"
                style={{ maxWidth: '100%' }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_70%)] pointer-events-none" />
        </div>
    );
}
