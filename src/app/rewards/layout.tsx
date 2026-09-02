import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Rewards & Support | Nawaetu",
    description: "Discover future Nawaetu rewards and offer support as a partner or contributor.",
    alternates: { canonical: "https://nawaetu.com/rewards" },
};

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
