import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import "./sirah.css";

export const metadata = pageMetadata(
  "Sirah Nabawiyah",
  "Jelajahi kisah Nabi Muhammad melalui bab-bab Sirah dari periode Makkah hingga Madinah di Nawaetu.",
  "/sirah",
);

export default function SirahLayout({ children }: { children: ReactNode }) {
  return children;
}
