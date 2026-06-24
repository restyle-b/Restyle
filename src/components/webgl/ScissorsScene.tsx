"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { Suspense, type RefObject } from "react";
import { ScissorsModel } from "./ScissorsModel";
import { HairStrands } from "./HairStrands";

function ScrollCamera({ scrollProgress }: { scrollProgress: RefObject<number> }) {
  const { camera } = useThree();
  useFrame(() => {
    camera.position.z = 6.5 - scrollProgress.current * 1.8;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export function ScissorsScene({ scrollProgress }: { scrollProgress: RefObject<number> }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: false }}
      camera={{ position: [0, 0, 6.5], fov: 35 }}
    >
      <color attach="background" args={["#050505"]} />
      <fogExp2 attach="fog" args={["#050505", 0.06]} />

      <ambientLight intensity={0.22} />
      <spotLight position={[4, 5, 4]} angle={0.4} penumbra={0.6} intensity={3.6} color="#eef3fa" />
      <spotLight position={[-4, -2, 3]} angle={0.5} penumbra={0.8} intensity={1.9} color="#fbf6e8" />
      <pointLight position={[0, 0, 5]} intensity={0.9} color="#ffffff" />

      <Suspense fallback={null}>
        <Environment files="/hdri/studio_small_03_1k.hdr" />
        <ScissorsModel scrollProgress={scrollProgress} />
      </Suspense>

      <HairStrands />

      {/* precision-engineering sparks near the blades */}
      <Sparkles count={24} scale={[2.5, 2.5, 2.5]} size={2.5} speed={0.3} opacity={0.9} color="#bfe0ff" />
      {/* soft background bokeh */}
      <Sparkles count={60} scale={[14, 9, 10]} size={4} speed={0.05} opacity={0.18} color="#ffffff" />

      <ScrollCamera scrollProgress={scrollProgress} />
    </Canvas>
  );
}
