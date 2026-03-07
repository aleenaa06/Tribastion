import React from 'react';

class GlobeErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            // Render a beautiful fallback so the page doesn't go blank
            return (
                <div className="flex items-center justify-center w-full h-full min-h-[400px] relative">
                    <div className="w-80 h-80 rounded-full border-2 border-cyan-500/30 flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/5 animate-pulse"></div>
                        <div className="w-60 h-60 rounded-full border border-cyan-700/50 flex items-center justify-center">
                            <div className="w-40 h-40 rounded-full border border-cyan-900/70 bg-cyan-950/30 flex items-center justify-center">
                                <span className="text-5xl opacity-60">🛡️</span>
                            </div>
                        </div>
                        {/* Orbit dots */}
                        {[0, 60, 120, 180, 240, 300].map((deg) => (
                            <div
                                key={deg}
                                className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${deg}deg) translateX(155px) translate(-50%, -50%)`
                                }}
                            />
                        ))}
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default GlobeErrorBoundary;
