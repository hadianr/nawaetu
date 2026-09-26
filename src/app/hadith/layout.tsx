import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Kumpulan Hadits dengan Terjemahan",
  "Jelajahi kumpulan hadits dengan teks Arab, transliterasi, terjemahan, perawi, dan referensi sumber di Nawaetu.",
  "/hadith",
);

export default function HadithLayout({ children }: { children: React.ReactNode }) {
  return children;
}
