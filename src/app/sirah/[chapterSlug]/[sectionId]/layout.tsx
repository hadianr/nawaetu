import { notFound } from "next/navigation";
import { getSirahSectionById } from "@/data/sirah";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterSlug: string; sectionId: string }>;
}) {
  const { chapterSlug, sectionId } = await params;
  const section = getSirahSectionById(sectionId);
  if (!section || section.chapterSlug !== chapterSlug) notFound();

  return pageMetadata(
    `${section.subbab} - ${section.chapterTitle}`,
    section.highlights || `${section.subbab} dalam Sirah Nabawiyah: ${section.chapterTitle}.`,
    `/sirah/${chapterSlug}/${sectionId}`,
  );
}

export default function SirahSectionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
