import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Asisten Muslim AI - Tanya Nawaetu",
  "Ajukan pertanyaan seputar Islam kepada asisten Muslim Nawaetu yang membantu menemukan jawaban berdasarkan Al-Qur'an, Sunnah, dan hadits.",
  "/mentor-ai",
);

export default function MentorAiLayout({ children }: { children: React.ReactNode }) {
  return children;
}
