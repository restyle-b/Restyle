import type { Metadata } from "next";
import { ScissorsExperience } from "@/components/webgl/ScissorsExperience";

export const metadata: Metadata = {
  title: "Restyle — WebGL Scissors Demo",
  robots: { index: false, follow: false },
};

export default function WebglDemoPage() {
  return <ScissorsExperience />;
}
