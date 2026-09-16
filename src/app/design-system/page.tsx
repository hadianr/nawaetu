import { notFound } from "next/navigation";

import DesignSystemFixture from "@/components/DesignSystemFixture";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <DesignSystemFixture />;
}
