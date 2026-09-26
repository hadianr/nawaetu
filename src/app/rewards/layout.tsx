import { Children } from "react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
    "Dukung Nawaetu dan Ajukan Kolaborasi",
    "Pelajari cara mendukung Nawaetu atau mengajukan hadiah dan kolaborasi untuk komunitas.",
    "/rewards",
);

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
    return <>{Children.toArray(children)}</>;
}
