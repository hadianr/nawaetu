import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Panduan dan Pelacak Ramadhan",
  "Gunakan panduan Ramadhan Nawaetu untuk jadwal ibadah, puasa, sholat, khataman Al-Qur'an, dan amalan harian.",
  "/ramadhan",
);

export default function RamadhanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
