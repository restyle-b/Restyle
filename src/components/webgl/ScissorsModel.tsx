"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { createChromeMaterial } from "./chromeMaterial";

const MODEL_URL = "/models/scissors.glb";

/** A logical scissors part — GLTFLoader gives multi-primitive nodes a Mesh per primitive wrapped in a Group, and single-primitive nodes a bare Mesh. */
function partMeshes(part: THREE.Object3D): THREE.Mesh[] {
  return part instanceof THREE.Mesh ? [part] : (part.children.filter(
    (c): c is THREE.Mesh => c instanceof THREE.Mesh,
  ));
}

function partVertexCount(part: THREE.Object3D) {
  return partMeshes(part).reduce(
    (sum, m) => sum + (m.geometry.attributes.position as THREE.BufferAttribute).count,
    0,
  );
}

function partCentroid(part: THREE.Object3D) {
  const centroid = new THREE.Vector3();
  let total = 0;
  for (const mesh of partMeshes(part)) {
    const position = mesh.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < position.count; i++) {
      centroid.x += position.getX(i);
      centroid.y += position.getY(i);
      centroid.z += position.getZ(i);
      total++;
    }
  }
  return total > 0 ? centroid.divideScalar(total) : centroid;
}

function setPartMaterial(part: THREE.Object3D, material: THREE.Material) {
  for (const mesh of partMeshes(part)) mesh.material = material;
}

/**
 * The source GLB has no rig — three loose parts (two blades + the pivot
 * screw) with no parent transforms. To get a believable scissors "breathing"
 * open/close we derive the hinge ourselves: the screw's bounding-box center
 * is the pivot point, and the axis the blades fan apart on falls out of the
 * cross product of each blade's centroid offset from that pivot. That's
 * robust to how the model happens to be oriented, so we don't have to guess
 * which axis is "up" in this particular export.
 */
function buildHinge(scene: THREE.Group) {
  const parts = scene.children;
  const sorted = [...parts].sort((a, b) => partVertexCount(a) - partVertexCount(b));
  const [screw, bladeA, bladeB] = sorted;
  if (!screw || !bladeA || !bladeB) return null;

  const pivot = partCentroid(screw);

  const vA = partCentroid(bladeA).sub(pivot);
  const vB = partCentroid(bladeB).sub(pivot);
  const axis = new THREE.Vector3().crossVectors(vA, vB).normalize();
  if (axis.lengthSq() < 1e-6) axis.set(1, 0, 0);

  // Re-anchor each blade's geometry to the pivot so rotating the wrapping
  // <group> below swings the blade around the screw instead of around the
  // scene origin.
  bladeA.position.sub(pivot);
  bladeB.position.sub(pivot);

  return { pivot, axis, screw, bladeA, bladeB };
}

export function ScissorsModel({
  scrollProgress,
}: {
  scrollProgress: RefObject<number>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const root = useRef<THREE.Group>(null);
  const hingeA = useRef<THREE.Group>(null);
  const hingeB = useRef<THREE.Group>(null);

  const reducedMotion = useMemo(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  const { hinge, materials } = useMemo(() => {
    const cloned = scene.clone(true);
    const hinge = buildHinge(cloned);
    const matA = createChromeMaterial("#eceef0");
    const matB = createChromeMaterial("#e3e6e9");
    const matScrew = createChromeMaterial("#f1f2f4");
    if (hinge) {
      setPartMaterial(hinge.bladeA, matA.material);
      setPartMaterial(hinge.bladeB, matB.material);
      setPartMaterial(hinge.screw, matScrew.material);
    }
    return { hinge, materials: [matA, matB, matScrew] };
  }, [scene]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (const { uniforms } of materials) uniforms.uTime.value = t;

    if (!hinge) return;
    const idle = reducedMotion ? 0 : Math.sin(t * 0.6) * 0.02;
    const scrollOpen = Math.sin(scrollProgress.current * Math.PI * 4) * 0.16;
    const angle = 0.1 + idle + scrollOpen;
    hingeA.current?.rotation.setFromVector3(
      hinge.axis.clone().multiplyScalar(angle),
    );
    hingeB.current?.rotation.setFromVector3(
      hinge.axis.clone().multiplyScalar(-angle),
    );

    if (root.current && !reducedMotion) {
      root.current.rotation.y = scrollProgress.current * Math.PI * 2.4 + t * 0.05;
    }
  });

  if (!hinge) return null;

  return (
    <group ref={root}>
      <primitive object={hinge.screw} />
      <group ref={hingeA} position={hinge.pivot}>
        <primitive object={hinge.bladeA} />
      </group>
      <group ref={hingeB} position={hinge.pivot}>
        <primitive object={hinge.bladeB} />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL_URL);
