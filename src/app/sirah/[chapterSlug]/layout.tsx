import { notFound } from "next/navigation";
import { getSirahChapterBySlug } from "@/data/sirah";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbList, article } from "@/components/seo/JsonLd";

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

export default async function SirahChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ chapterSlug: string }>;
}) {
  const { chapterSlug } = await params;
  const chapter = getSirahChapterBySlug(chapterSlug);
  if (!chapter) notFound();
  const path = `/sirah/${chapter.slug}`;

  return (
    <>
      <JsonLd data={breadcrumbList([
        { name: "Nawaetu", path: "/" },
        { name: "Sirah", path: "/sirah" },
        { name: chapter.title, path },
      ])} />
      <JsonLd data={article(`${chapter.title} - Sirah Nabawiyah`, chapter.summary, path)} />
      {children}
    </>
  );
}
