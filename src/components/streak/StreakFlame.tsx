import { Flame } from "lucide-react";
import LottieMoment from "@/components/ui/LottieMoment";
import { cn } from "@/lib/utils";

/** Lottie flame for earned streak moments; shows the plain icon when motion is reduced. */
export default function StreakFlame({ className, fallbackClassName, label }: { className: string; fallbackClassName: string; label?: string }) {
    return (
        <span role={label ? "img" : undefined} aria-label={label} className="inline-flex">
            <LottieMoment
                src="/lottie/flame.lottie"
                className={className}
                fallback={<Flame className={cn("fill-current", fallbackClassName)} aria-hidden="true" />}
            />
        </span>
    );
}
