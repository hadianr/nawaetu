import type { ComponentType, SVGProps } from "react";
import {
    Bell,
    BookMarked,
    BookOpen,
    CalendarDays,
    CircleHelp,
    CloudSun,
    Compass,
    Droplets,
    Fingerprint,
    HandHeart,
    HeartHandshake,
    House,
    Landmark,
    LibraryBig,
    Lock,
    Moon,
    RotateCcw,
    ScrollText,
    Settings,
    ShieldCheck,
    SlidersHorizontal,
    Sparkles,
    Star,
    Sun,
    Target,
    Trophy,
    Utensils,
    Volume2,
    TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KaabaIcon } from "@/components/icons/KaabaIcon";
import type { AppIconName } from "@/lib/icon-names";
export { resolveAppIconName } from "@/lib/icon-names";

export type AppIconSize = "xs" | "sm" | "md" | "lg" | "xl" | "display";
export type AppIconTone = "default" | "muted" | "primary" | "success" | "warning" | "danger" | "info";


type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<Exclude<AppIconName, "kaaba">, IconComponent> = {
    bell: Bell,
    book: BookOpen,
    "book-marked": BookMarked,
    calendar: CalendarDays,
    "cloud-sun": CloudSun,
    compass: Compass,
    droplets: Droplets,
    fingerprint: Fingerprint,
    hands: HandHeart,
    "heart-handshake": HeartHandshake,
    home: House,
    landmark: Landmark,
    library: LibraryBig,
    lock: Lock,
    moon: Moon,
    refresh: RotateCcw,
    scroll: ScrollText,
    settings: Settings,
    "shield-check": ShieldCheck,
    sliders: SlidersHorizontal,
    sparkles: Sparkles,
    star: Star,
    sun: Sun,
    target: Target,
    trophy: Trophy,
    utensils: Utensils,
    volume: Volume2,
    warning: TriangleAlert,
    help: CircleHelp,
};

const SIZE_CLASSES: Record<AppIconSize, string> = {
    xs: "size-3.5",
    sm: "size-4",
    md: "size-5",
    lg: "size-6",
    xl: "size-8",
    display: "size-10",
};

const TONE_CLASSES: Record<AppIconTone, string> = {
    default: "text-[rgb(var(--color-text))]",
    muted: "text-[rgb(var(--color-text-muted))]",
    primary: "text-[rgb(var(--color-primary))]",
    success: "text-[rgb(var(--color-success))]",
    warning: "text-[rgb(var(--color-warning))]",
    danger: "text-[rgb(var(--color-danger))]",
    info: "text-[rgb(var(--color-info))]",
};

export interface AppIconProps extends SVGProps<SVGSVGElement> {
    name: AppIconName;
    size?: AppIconSize;
    tone?: AppIconTone;
    label?: string;
}

export function AppIcon({ name, size = "md", tone = "default", label, className, ...props }: AppIconProps) {
    const iconProps = {
        ...props,
        className: cn(SIZE_CLASSES[size], TONE_CLASSES[tone], className),
        ...(label ? { "aria-label": label, role: "img" as const } : { "aria-hidden": true as const }),
    };

    if (name === "kaaba") return <KaabaIcon {...iconProps} />;

    // Keep persisted/remote icon values safe even when a newer name is not yet bundled.
    const Icon = ICONS[name] ?? CircleHelp;
    return <Icon {...iconProps} />;
}
