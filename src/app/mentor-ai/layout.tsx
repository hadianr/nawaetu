import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Asisten Muslim AI - Tanya Nawaetu",
  "Ajukan pertanyaan seputar Islam kepada asisten Muslim Nawaetu yang membantu menemukan jawaban berdasarkan Al-Qur'an, Sunnah, dan hadits.",
  "/mentor-ai",
);

// Seconds. Applies to the askMentor server action used by this page: models are tried one after another, 15 s each.
// Set here, not on page.tsx: segment config cannot be exported from a client component.
export const maxDuration = 60;

export default function MentorAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
