import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
import { RAMADHAN_PAGE_ENABLED } from "@/lib/features";

export const metadata = pageMetadata(
  "Panduan dan Pelacak Ramadhan",
  "Gunakan panduan Ramadhan Nawaetu untuk jadwal ibadah, puasa, sholat, khataman Al-Qur'an, dan amalan harian.",
  "/ramadhan",
);

export default function RamadhanLayout({ children }: { children: React.ReactNode }) {
  // Taken out until Ramadan: see lib/features.ts.
  if (!RAMADHAN_PAGE_ENABLED) notFound();
  return children;
}
