import type { ReactNode } from "react";
import { pageMetadata } from "@/lib/seo";
import { SIRAH_SEO } from "@/data/sirah/seo";
import "./sirah.css";

export const metadata = pageMetadata(SIRAH_SEO.hub.title, SIRAH_SEO.hub.description, "/sirah");

export default function SirahLayout({ children }: { children: ReactNode }) {
  return children;
}
