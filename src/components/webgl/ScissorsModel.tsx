"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { createChromeMaterial } from "./chromeMaterial";
import { buildBladeGeometry, buildScrewGeometry, HINGE_AXIS } from "./scissorsGeometry";

/** Local-space pivot: the procedural blade shapes are authored with the screw at (0, 0). */
const PIVOT = new THREE.Vector3(0, 0, 0);

export function ScissorsModel({
  scrollProgress,
}: {
  scrollProgress: RefObject<number>;
}) {
  const root = useRef<THREE.Group>(null);
  const hingeA = useRef<THREE.Group>(null);
  const hingeB = useRef<THREE.Group>(null);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const { bladeGeometryA, bladeGeometryB, screwGeometry, matA, matB, matScrew } = useMemo(() => {
    const bladeGeometryA = buildBladeGeometry(false);
    const bladeGeometryB = buildBladeGeometry(true);
    const screwGeometry = buildScrewGeometry();
    const matA = createChromeMaterial("#eceef0");
    const matB = createChromeMaterial("#e3e6e9");
    const matScrew = createChromeMaterial("#f1f2f4");
    return { bladeGeometryA, bladeGeometryB, screwGeometry, matA, matB, matScrew };
  }, []);

  const materials = [matA, matB, matScrew];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const { uniforms } of materials) uniforms.uTime.value = t;

    const idle = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.02;
    const scrollOpen = Math.sin(scrollProgress.current * Math.PI * 4) * 0.16;
    const angle = 0.1 + idle + scrollOpen;
    hingeA.current?.rotation.setFromVector3(HINGE_AXIS.clone().multiplyScalar(angle));
    hingeB.current?.rotation.setFromVector3(HINGE_AXIS.clone().multiplyScalar(-angle));

    if (root.current && !reducedMotion) {
      root.current.rotation.y = scrollProgress.current * Math.PI * 2.4 + t * 0.05;
    }
  });

  return (
    <group ref={root}>
      <mesh geometry={screwGeometry} material={matScrew.material} rotation={[Math.PI / 2, 0, 0]} />
      <group ref={hingeA} position={PIVOT}>
        <mesh geometry={bladeGeometryA} material={matA.material} />
      </group>
      <group ref={hingeB} position={PIVOT}>
        <mesh geometry={bladeGeometryB} material={matB.material} />
      </group>
    </group>
  );
}
