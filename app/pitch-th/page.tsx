import type { Metadata } from "next";
import { PitchDeck, thaiPitchContent } from "@/components/pitch-deck";

export const metadata: Metadata = {
  title: "ENVY Partner Club | GT Market Development",
  description: "GT reward campaign for outlet activation and market visibility."
};

export default function ThaiPitchPage() {
  return <PitchDeck content={thaiPitchContent} />;
}
