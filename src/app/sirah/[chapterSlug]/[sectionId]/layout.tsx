import { notFound } from "next/navigation";
import { getSirahSectionById } from "@/data/sirah";
import { pageMetadata } from "@/lib/seo";
import { JsonLd, breadcrumbList, article } from "@/components/seo/JsonLd";

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

export default async function SirahSectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ chapterSlug: string; sectionId: string }>;
}) {
  const { chapterSlug, sectionId } = await params;
  const section = getSirahSectionById(sectionId);
  if (!section || section.chapterSlug !== chapterSlug) notFound();
  const path = `/sirah/${chapterSlug}/${sectionId}`;

  return (
    <>
      <JsonLd data={breadcrumbList([
        { name: "Nawaetu", path: "/" },
        { name: "Sirah", path: "/sirah" },
        { name: section.chapterTitle, path: `/sirah/${chapterSlug}` },
        { name: section.subbab, path },
      ])} />
      <JsonLd data={article(`${section.subbab} - ${section.chapterTitle}`, section.highlights || `${section.subbab} dalam Sirah Nabawiyah: ${section.chapterTitle}.`, path)} />
      {children}
    </>
  );
}
