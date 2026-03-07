import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';

export default function CyberGlobe() {
    const globeEl = useRef();

    useEffect(() => {
        // Auto-rotate the globe slowly
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.controls().enableZoom = false;
        }
    }, []);

    // Generate some random points to look like cyber connection nodes
    const N = 20;
    const gData = [...Array(N).keys()].map(() => ({
        lat: (Math.random() - 0.5) * 180,
        lng: (Math.random() - 0.5) * 360,
        size: Math.random() * 0.5 + 0.1,
        color: ['#00BFFF', '#22d3ee', '#0ea5e9'][Math.round(Math.random() * 2)]
    }));

    return (
        <div className="flex items-center justify-center w-full h-full min-h-[400px] relative pointer-events-none">
            {/* The Globe Canvas */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto mix-blend-screen opacity-80">
                <Globe
                    ref={globeEl}
                    width={400}
                    height={400}
                    backgroundColor="rgba(0,0,0,0)"
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-water.png"
                    // Customize the look to fit the cyber theme
                    showAtmosphere={true}
                    atmosphereColor="#22d3ee"
                    atmosphereAltitude={0.15}

                    pointsData={gData}
                    pointAltitude={0.05}
                    pointColor="color"
                    pointRadius="size"
                />
            </div>

            {/* Overlay glow/vignette to blend the globe edges into the background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#020617_70%)] pointer-events-none" />
        </div>
    );
}
