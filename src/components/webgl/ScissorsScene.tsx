"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Sparkles } from "@react-three/drei";
import { Suspense, type RefObject, useRef } from "react";
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

/**
 * Opening "snip": uses the actual WebGL scissor test (gl.setScissor /
 * setScissorTest) to clip rendering to a horizontal band that expands from a
 * thin line to the full canvas on load — the scene reveals as if cut open,
 * fitting for a scissors demo. Skipped for prefers-reduced-motion.
 */
function CutReveal() {
  const { gl, size } = useThree();
  const start = useRef<number | null>(null);
  const done = useRef(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  useFrame(({ clock }) => {
    if (done.current) return;
    if (reducedMotion.current) {
      gl.setScissorTest(false);
      done.current = true;
      return;
    }
    if (start.current === null) start.current = clock.elapsedTime;

    const t = Math.min((clock.elapsedTime - start.current) / 1.1, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const revealHeight = Math.max(1, Math.round(size.height * eased));

    gl.setScissorTest(true);
    gl.setScissor(0, (size.height - revealHeight) / 2, size.width, revealHeight);

    if (t >= 1) {
      gl.setScissorTest(false);
      done.current = true;
    }
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
      <CutReveal />
    </Canvas>
  );
}
