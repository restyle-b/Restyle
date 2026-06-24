"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const STRAND_COUNT = 16;

const vertexShader = `
  uniform float uTime;
  uniform float uPhase;
  uniform float uLength;
  varying float vH;

  void main() {
    float h = clamp((position.y + uLength * 0.5) / uLength, 0.0, 1.0);
    float sway =
      sin(h * 6.0 + uTime * 0.8 + uPhase) * 0.16 * h * h +
      sin(h * 3.0 - uTime * 0.5 + uPhase * 1.7) * 0.08 * h;
    vec3 displaced = position + vec3(sway, 0.0, sway * 0.6);
    vH = h;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const fragmentShader = `
  varying float vH;
  void main() {
    float alpha = smoothstep(0.05, 0.35, vH) * (1.0 - vH * 0.35) * 0.5;
    gl_FragColor = vec4(0.92, 0.93, 0.95, alpha);
  }
`;

function makeStrand(seed: number) {
  const length = 1.6 + Math.random() * 1.4;
  const geometry = new THREE.CylinderGeometry(0.006, 0.012, length, 5, 20, true);
  const uniforms = {
    uTime: { value: 0 },
    uPhase: { value: seed },
    uLength: { value: length },
  };
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 3.2,
    (Math.random() - 0.5) * 2.4,
    (Math.random() - 0.5) * 2.4,
  );
  const rotation = new THREE.Euler(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI,
  );
  return { geometry, material, uniforms, position, rotation };
}

/** Zero-gravity hair strands drifting around the scissors — pure shader sway, no per-frame geometry rebuilds. */
export function HairStrands() {
  const strands = useMemo(
    () => Array.from({ length: STRAND_COUNT }, (_, i) => makeStrand(i * 1.37)),
    [],
  );
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    for (const s of strands) s.uniforms.uTime.value = clock.elapsedTime;
    if (group.current) group.current.rotation.y = clock.elapsedTime * 0.02;
  });

  return (
    <group ref={group}>
      {strands.map((s, i) => (
        <mesh
          key={i}
          geometry={s.geometry}
          material={s.material}
          position={s.position}
          rotation={s.rotation}
        />
      ))}
    </group>
  );
}
