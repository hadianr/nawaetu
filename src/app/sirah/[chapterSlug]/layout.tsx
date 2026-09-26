import { notFound } from "next/navigation";
import { getSirahChapterBySlug } from "@/data/sirah";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}) {
  const { chapterSlug } = await params;
  const chapter = getSirahChapterBySlug(chapterSlug);
  if (!chapter) notFound();

  return pageMetadata(
    `${chapter.title} - Sirah Nabawiyah`,
    chapter.summary,
    `/sirah/${chapter.slug}`,
  );
}

export default function SirahChapterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
