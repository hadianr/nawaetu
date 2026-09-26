import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Arah Kiblat Online dengan Kompas",
  "Temukan arah kiblat dengan kompas digital Nawaetu. Aktifkan izin lokasi dan sensor perangkat untuk menentukan arah dari lokasi Anda.",
  "/qibla",
);

export default function QiblaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
