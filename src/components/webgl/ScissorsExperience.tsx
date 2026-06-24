"use client";

import { ScissorsScene } from "./ScissorsScene";
import { useScrollProgress } from "./useScrollProgress";

export function ScissorsExperience() {
  const scrollProgress = useScrollProgress();

  return (
    <div className="relative h-[300vh] bg-black">
      <div className="fixed inset-0">
        <ScissorsScene scrollProgress={scrollProgress} />
      </div>

      <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-between px-6 py-16 text-center text-white">
        <p className="text-xs uppercase tracking-[0.35em] text-white/50">Restyle — Precision</p>
        <div>
          <h1 className="text-4xl font-light tracking-wide sm:text-6xl">Crafted in Silver</h1>
          <p className="mt-3 text-sm text-white/60">Scroll to set the blades in motion</p>
        </div>
        <p className="text-[10px] text-white/30">
          3D model: &ldquo;Scissors&rdquo; by sirkitree (poly.pizza), CC-BY 3.0 · HDRI: Studio Small 03 (polyhaven.com), CC0
        </p>
      </div>
    </div>
  );
}
