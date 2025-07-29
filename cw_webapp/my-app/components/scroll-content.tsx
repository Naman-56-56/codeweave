"use client"

import { ScrollControls, Scroll } from "@react-three/drei"

export default function ScrollContent() {
  return (
    <ScrollControls pages={5} damping={0.1}>
      <Scroll html>
        <div className="w-full">
          {/* Section 1: Pre-Launch */}
          <section className="h-screen flex items-center justify-end pr-20">
            <div className="max-w-md text-right">
              <h1 className="text-6xl font-bold text-white mb-6 drop-shadow-lg">MISSION</h1>
              <p className="text-xl text-gray-200 mb-8 drop-shadow">
                Prepare for an extraordinary journey through space. Our rocket awaits launch.
              </p>
              <div className="text-sm text-gray-300 drop-shadow">Scroll to begin the mission</div>
            </div>
          </section>

          {/* Section 2: Launch */}
          <section className="h-screen flex items-center justify-start pl-20">
            <div className="max-w-md">
              <h2 className="text-5xl font-bold text-orange-400 mb-6 drop-shadow-lg">IGNITION</h2>
              <p className="text-xl text-gray-200 mb-8 drop-shadow">
                Engines firing at maximum thrust. Feel the power as we break free from Earth's gravity.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                <div className="bg-black/30 p-3 rounded backdrop-blur">
                  <div className="text-orange-400 font-bold">THRUST</div>
                  <div>100%</div>
                </div>
                <div className="bg-black/30 p-3 rounded backdrop-blur">
                  <div className="text-orange-400 font-bold">ALTITUDE</div>
                  <div>Rising</div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Flight */}
          <section className="h-screen flex items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="text-5xl font-bold text-blue-400 mb-6 drop-shadow-lg">ORBIT</h2>
              <p className="text-xl text-gray-200 mb-8 drop-shadow">
                Successfully reaching orbital velocity. Experience the serenity of space flight.
              </p>
              <div className="bg-black/30 p-6 rounded-lg backdrop-blur">
                <div className="text-blue-400 font-bold mb-2">MISSION STATUS</div>
                <div className="text-green-400">NOMINAL</div>
              </div>
            </div>
          </section>

          {/* Section 4: Crisis */}
          <section className="h-screen flex items-center justify-end pr-20">
            <div className="max-w-md text-right">
              <h2 className="text-5xl font-bold text-red-500 mb-6 drop-shadow-lg animate-pulse">MALFUNCTION</h2>
              <p className="text-xl text-gray-200 mb-8 drop-shadow">
                Critical system failure detected. Initiating emergency protocols.
              </p>
              <div className="bg-red-900/50 p-4 rounded border border-red-500 backdrop-blur">
                <div className="text-red-400 font-bold text-sm">⚠ ALERT</div>
                <div className="text-red-300 text-sm">Navigation systems offline</div>
              </div>
            </div>
          </section>

          {/* Section 5: Crash */}
          <section className="h-screen flex items-center justify-center">
            <div className="max-w-md text-center">
              <h2 className="text-6xl font-bold text-red-600 mb-6 drop-shadow-lg">IMPACT</h2>
              <p className="text-xl text-gray-200 mb-8 drop-shadow">
                Mission terminated. But every failure teaches us something new for the next launch.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Restart Mission
              </button>
            </div>
          </section>
        </div>
      </Scroll>
    </ScrollControls>
  )
}
