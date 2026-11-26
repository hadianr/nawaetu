import type { ComponentType, SVGProps } from "react";
import {
    AlarmClock,
    Bell,
    BookHeart,
    BookMarked,
    BookOpen,
    BookOpenCheck,
    CalendarClock,
    CalendarDays,
    CircleHelp,
    Clock,
    CloudRain,
    CloudSun,
    Compass,
    DoorOpen,
    Droplets,
    Eclipse,
    Fingerprint,
    Gift,
    HandCoins,
    HandHeart,
    Handshake,
    HeartHandshake,
    HeartPulse,
    House,
    LibraryBig,
    Lightbulb,
    Lock,
    MessageCircle,
    MessageCircleHeart,
    Moon,
    MoonStar,
    NotebookPen,
    RotateCcw,
    Scale,
    ScrollText,
    Settings,
    ShieldCheck,
    Signpost,
    SlidersHorizontal,
    Soup,
    Sparkles,
    Star,
    Sun,
    SunDim,
    SunMedium,
    Sunrise,
    Sunset,
    Target,
    TriangleAlert,
    Trophy,
    Undo2,
    UsersRound,
    Utensils,
    UtensilsCrossed,
    Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CalendarHeartIcon, DuaIcon, FlowerIcon, GoalIcon, HeadphonesIcon, HijabIcon, KaabaIcon, KetupatIcon, MosqueIcon, MuslimIcon, PrayerRugIcon, ShowerHeadIcon, TasbihIcon } from "@/components/icons/NawaetuIcons";
import { resolveAppIconName, type AppIconName } from "@/lib/icon-names";
export { resolveAppIconName } from "@/lib/icon-names";

export type AppIconSize = "xs" | "sm" | "md" | "lg" | "xl" | "display";
export type AppIconTone = "default" | "muted" | "primary" | "success" | "warning" | "danger" | "info";


type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<AppIconName, IconComponent> = {
    "alarm-clock": AlarmClock,
    "bell": Bell,
    "book": BookOpen,
    "book-check": BookOpenCheck,
    "book-heart": BookHeart,
    "book-marked": BookMarked,
    "calendar": CalendarDays,
    "calendar-clock": CalendarClock,
    "calendar-heart": CalendarHeartIcon,
    "clock": Clock,
    "cloud-rain": CloudRain,
    "cloud-sun": CloudSun,
    "compass": Compass,
    "door-open": DoorOpen,
    "droplets": Droplets,
    "dua": DuaIcon,
    "goal": GoalIcon,
    "hijab": HijabIcon,
    "eclipse": Eclipse,
    "flower": FlowerIcon,
    "headphones": HeadphonesIcon,
    "fingerprint": Fingerprint,
    "gift": Gift,
    "hand-coins": HandCoins,
    "hand-heart": HandHeart,
    "handshake": Handshake,
    "heart-handshake": HeartHandshake,
    "heart-pulse": HeartPulse,
    "help": CircleHelp,
    "home": House,
    "kaaba": KaabaIcon,
    "ketupat": KetupatIcon,
    "library": LibraryBig,
    "lightbulb": Lightbulb,
    "lock": Lock,
    "message": MessageCircle,
    "message-heart": MessageCircleHeart,
    "moon": Moon,
    "moon-star": MoonStar,
    "mosque": MosqueIcon,
    "muslim": MuslimIcon,
    "prayer-rug": PrayerRugIcon,
    "notebook-pen": NotebookPen,
    "refresh": RotateCcw,
    "scale": Scale,
    "scroll": ScrollText,
    "settings": Settings,
    "shower-head": ShowerHeadIcon,
    "shield-check": ShieldCheck,
    "signpost": Signpost,
    "sliders": SlidersHorizontal,
    "soup": Soup,
    "sparkles": Sparkles,
    "star": Star,
    "sun": Sun,
    "sun-dim": SunDim,
    "sun-medium": SunMedium,
    "sunrise": Sunrise,
    "sunset": Sunset,
    "target": Target,
    "tasbih": TasbihIcon,
    "trophy": Trophy,
    "undo": Undo2,
    "users": UsersRound,
    "utensils": Utensils,
    "utensils-crossed": UtensilsCrossed,
    "volume": Volume2,
    "warning": TriangleAlert,
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
    primary: "text-[rgb(var(--color-primary-strong))]",
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

    // Persisted/remote values may hold renamed or unknown names; resolve them safely.
    const Icon = ICONS[resolveAppIconName(name)];
    return <Icon {...iconProps} />;
}
