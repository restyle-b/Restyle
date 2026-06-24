import * as THREE from "three";

/**
 * Liquid-metal / brushed-chrome look for the scissors blades.
 *
 * Built on MeshPhysicalMaterial (so it still picks up the HDRI from
 * <Environment> for real reflections) and extended via onBeforeCompile with
 * a tiny value-noise pass that perturbs the normal — this is what reads as
 * "microscopic scratches" and a faint brushed-metal grain instead of a
 * perfectly smooth mirror. A slow cosine drives a highlight band that sweeps
 * across the surface over time, giving the "shifting between brushed silver
 * and cold chrome" effect from the brief without needing a video texture.
 */
export function createChromeMaterial(tint: THREE.ColorRepresentation = "#e9ebee") {
  const uniforms = { uTime: { value: 0 } };

  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(tint),
    metalness: 1,
    roughness: 0.18,
    clearcoat: 0.75,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.8,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;

    shader.fragmentShader =
      `uniform float uTime;\n` +
      `float restyleHash(vec2 p) {\n` +
      `  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);\n` +
      `}\n` +
      `float restyleNoise(vec2 p) {\n` +
      `  vec2 i = floor(p);\n` +
      `  vec2 f = fract(p);\n` +
      `  float a = restyleHash(i);\n` +
      `  float b = restyleHash(i + vec2(1.0, 0.0));\n` +
      `  float c = restyleHash(i + vec2(0.0, 1.0));\n` +
      `  float d = restyleHash(i + vec2(1.0, 1.0));\n` +
      `  vec2 u = f * f * (3.0 - 2.0 * f);\n` +
      `  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;\n` +
      `}\n` +
      shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
      {
        // brushed-metal grain: thin scratches running along one axis, with a
        // slow drift so the surface never looks perfectly static (the
        // "liquid metal" feel from the brief).
        vec2 grainUv = vViewPosition.xy * vec2(6.0, 220.0) + vec2(uTime * 0.015, 0.0);
        float grain = restyleNoise(grainUv) - 0.5;
        normal = normalize(normal + vec3(grain * 0.05, grain * 0.05, 0.0));
      }`,
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `{
        // slow highlight band sweeping across the blade — brushed silver
        // cooling to chrome and back.
        float band = sin(vViewPosition.y * 2.2 + uTime * 0.4) * 0.5 + 0.5;
        vec3 cold = vec3(0.92, 0.96, 1.02);
        vec3 warm = vec3(1.04, 1.02, 0.98);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * mix(warm, cold, band), 0.12);
      }
      #include <dithering_fragment>`,
    );

    material.userData.shader = shader;
  };

  return { material, uniforms };
}
