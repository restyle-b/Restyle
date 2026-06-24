import * as THREE from "three";

/**
 * Procedural scissors blade: a 2D silhouette (blade taper -> shank -> a true
 * circular finger ring with a punched hole) extruded with a bevel. Built in
 * code instead of using the low-poly GLB so the finger rings are genuinely
 * round (lathe-perfect circles) rather than the faceted hexagons a low-vertex
 * mesh produces, and so the beveled edges catch specular highlights the way
 * real polished chrome does.
 *
 * The shape is authored with the pivot screw at local (0, 0) so the caller
 * can rotate the blade group directly around the Z axis for the open/close
 * hinge, no centroid/hinge-detection math needed.
 */
const TIP_X = 2.7;
const SPINE_CTRL = [1.3, 0.24] as const;
const ROOT_BOTTOM_Y = -0.1;
const ROOT_TOP_Y = 0.12;
const FLARE_CTRL_X = -0.68;
const RING_CENTER_X = -1.8;
const OUTER_RADIUS = 0.55;
const INNER_RADIUS = 0.34;
const HALF_ANGLE = (35 * Math.PI) / 180;
const JOIN_X = RING_CENTER_X + OUTER_RADIUS * Math.cos(HALF_ANGLE);
const JOIN_Y = OUTER_RADIUS * Math.sin(HALF_ANGLE);

function bladeShape(flip: boolean) {
  const s = flip ? -1 : 1;
  const shape = new THREE.Shape();

  shape.moveTo(TIP_X, 0);
  shape.lineTo(0, s * ROOT_BOTTOM_Y);
  shape.quadraticCurveTo(FLARE_CTRL_X, s * -0.32, JOIN_X, s * -JOIN_Y);
  shape.absarc(RING_CENTER_X, 0, OUTER_RADIUS, s * -HALF_ANGLE, s * HALF_ANGLE, !flip);
  shape.quadraticCurveTo(FLARE_CTRL_X, s * 0.32, 0, s * ROOT_TOP_Y);
  shape.quadraticCurveTo(SPINE_CTRL[0], s * SPINE_CTRL[1], TIP_X, 0);

  const hole = new THREE.Path();
  hole.absarc(RING_CENTER_X, 0, INNER_RADIUS, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  return shape;
}

export function buildBladeGeometry(flip: boolean) {
  const geometry = new THREE.ExtrudeGeometry(bladeShape(flip), {
    depth: 0.09,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 4,
    curveSegments: 24,
  });
  // Center thickness only (Z), since full .center() would also shift X/Y and
  // drag the pivot screw away from local (0, 0) that the caller rotates on.
  geometry.translate(0, 0, -0.045);
  geometry.computeVertexNormals();
  return geometry;
}

export function buildScrewGeometry() {
  return new THREE.CylinderGeometry(0.1, 0.1, 0.14, 32);
}

/** Rotation axis for the open/close hinge — perpendicular to the blade's flat face. */
export const HINGE_AXIS = new THREE.Vector3(0, 0, 1);
