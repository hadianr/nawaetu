import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Kumpulan Doa Harian dengan Terjemahan",
  "Temukan doa harian dengan teks Arab, transliterasi, terjemahan, dan referensi sumber dalam bahasa Indonesia dan Inggris.",
  "/dua",
);

export default function DuaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
