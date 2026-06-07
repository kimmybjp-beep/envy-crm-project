import type { Metadata } from "next";
import { PitchDeck, englishPitchContent } from "@/components/pitch-deck";

export const metadata: Metadata = {
  title: "ENVY Partner Club | GT Market Development",
  description: "GT reward campaign for outlet activation and market visibility."
};

export default function PitchPage() {
  return <PitchDeck content={englishPitchContent} />;
}
