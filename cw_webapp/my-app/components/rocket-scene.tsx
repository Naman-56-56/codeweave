"use client"

import { useRef, useEffect } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import { useGLTF, useScroll, Environment, useAnimations } from "@react-three/drei"
import type { Group } from "three"
import * as THREE from "three"

export default function RocketScene() {
  const rocketRef = useRef<Group>(null)
  const { scene, animations } = useGLTF("/models/rocket.glb")
  const { actions } = useAnimations(animations, rocketRef)
  const scroll = useScroll()
  const { camera } = useThree()

  // Particle system for exhaust
  const exhaustRef = useRef<THREE.Points>(null)
  const particlesRef = useRef<THREE.BufferGeometry>(null)

  useEffect(() => {
    // Create exhaust particles
    const particleCount = 100
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5
      positions[i * 3 + 1] = -Math.random() * 2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5

      velocities[i * 3] = (Math.random() - 0.5) * 0.1
      velocities[i * 3 + 1] = -Math.random() * 0.2 - 0.1
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.1
    }

    if (particlesRef.current) {
      particlesRef.current.setAttribute("position", new THREE.BufferAttribute(positions, 3))
      particlesRef.current.setAttribute("velocity", new THREE.BufferAttribute(velocities, 3))
    }
  }, [])

  useFrame((state, delta) => {
    if (!rocketRef.current || !scroll) return

    const scrollProgress = scroll.offset
    const rocket = rocketRef.current

    // Phase 1: Pre-launch (0-0.2)
    if (scrollProgress < 0.2) {
      const phase1Progress = scrollProgress / 0.2
      rocket.position.set(0, -5 + phase1Progress * 2, 0)
      rocket.rotation.set(0, 0, Math.sin(state.clock.elapsedTime * 2) * 0.05)

      // Camera shake for anticipation
      camera.position.x = Math.sin(state.clock.elapsedTime * 10) * 0.1 * phase1Progress
      camera.position.y = Math.cos(state.clock.elapsedTime * 8) * 0.05 * phase1Progress
    }

    // Phase 2: Launch (0.2-0.4)
    else if (scrollProgress < 0.4) {
      const phase2Progress = (scrollProgress - 0.2) / 0.2
      rocket.position.set(0, -3 + phase2Progress * 15, 0)
      rocket.rotation.set(-phase2Progress * 0.3, 0, 0)

      // Intense camera shake during launch
      camera.position.x = Math.sin(state.clock.elapsedTime * 20) * 0.3
      camera.position.y = Math.cos(state.clock.elapsedTime * 15) * 0.2
      camera.position.z = 10 + Math.sin(state.clock.elapsedTime * 25) * 0.5

      // Show exhaust particles
      if (exhaustRef.current) {
        exhaustRef.current.visible = true
        const positions = particlesRef.current?.attributes.position.array as Float32Array
        const velocities = particlesRef.current?.attributes.velocity.array as Float32Array

        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i]
          positions[i + 1] += velocities[i + 1] - 0.1
          positions[i + 2] += velocities[i + 2]

          // Reset particles that go too far
          if (positions[i + 1] < -5) {
            positions[i] = (Math.random() - 0.5) * 0.5
            positions[i + 1] = 0
            positions[i + 2] = (Math.random() - 0.5) * 0.5
          }
        }

        if (particlesRef.current) {
          particlesRef.current.attributes.position.needsUpdate = true
        }
      }
    }

    // Phase 3: Flight (0.4-0.7)
    else if (scrollProgress < 0.7) {
      const phase3Progress = (scrollProgress - 0.4) / 0.3
      rocket.position.set(
        Math.sin(phase3Progress * Math.PI * 2) * 3,
        12 + phase3Progress * 8,
        Math.cos(phase3Progress * Math.PI) * 2,
      )
      rocket.rotation.set(
        -0.3 + Math.sin(phase3Progress * Math.PI * 4) * 0.2,
        phase3Progress * Math.PI * 2,
        Math.sin(phase3Progress * Math.PI * 6) * 0.1,
      )

      // Smooth camera follow
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, rocket.position.x * 0.3, 0.05)
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, rocket.position.y * 0.2, 0.05)
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, 10, 0.05)
      camera.lookAt(rocket.position)

      // Reduce exhaust
      if (exhaustRef.current) {
        exhaustRef.current.visible = phase3Progress < 0.5
      }
    }

    // Phase 4: Crash (0.7-1.0)
    else {
      const phase4Progress = (scrollProgress - 0.7) / 0.3
      const crashIntensity = Math.min(phase4Progress * 2, 1)

      rocket.position.set(
        Math.sin(phase4Progress * Math.PI * 8) * 2 * crashIntensity,
        20 - phase4Progress * 25,
        Math.cos(phase4Progress * Math.PI * 6) * 1.5 * crashIntensity,
      )

      rocket.rotation.set(-0.3 + crashIntensity * Math.PI * 2, phase4Progress * Math.PI * 8, crashIntensity * Math.PI)

      // Dramatic camera movement for crash
      camera.position.x = Math.sin(state.clock.elapsedTime * 30) * 2 * crashIntensity
      camera.position.y = Math.cos(state.clock.elapsedTime * 25) * 1.5 * crashIntensity
      camera.position.z = 10 - crashIntensity * 5

      // Hide exhaust during crash
      if (exhaustRef.current) {
        exhaustRef.current.visible = false
      }
    }
  })

  return (
    <>
      <Environment preset="sunset" />

      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, -10, 0]} intensity={0.5} color="#ff4500" />

      {/* Rocket Model */}
      <group ref={rocketRef}>
        <primitive object={scene.clone()} scale={[0.5, 0.5, 0.5]} />
      </group>

      {/* Exhaust Particles */}
      <points ref={exhaustRef} position={[0, -1, 0]} visible={false}>
        <bufferGeometry ref={particlesRef}>
          <bufferAttribute attach="attributes-position" count={100} array={new Float32Array(300)} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial size={0.1} color="#ff4500" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </points>

      {/* Background Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={1000}
            array={new Float32Array(Array.from({ length: 3000 }, () => (Math.random() - 0.5) * 100))}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.05} color="white" transparent opacity={0.6} />
      </points>
    </>
  )
}

useGLTF.preload("/models/rocket.glb")
