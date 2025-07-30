"use client"

import { Canvas } from "@react-three/fiber"
import { Suspense } from "react"
import RocketExperience from "@/components/rocket-experience"

export default function Home() {
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-blue-900">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }} gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <RocketExperience />
        </Suspense>
      </Canvas>
    </div>
  )
}
