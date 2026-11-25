import { AlertTriangle, Moon, Star } from "@/components/ui/icons";
import type { HijriEvent, HijriEventId } from "@/data/hijri-events";
import { cn } from "@/lib/utils";

/** Each kind has its own shape, not only its own colour, so the grid reads in every theme and without colour vision. */
export type MarkerKind = "prohibited" | "obligatory" | "night" | "annual" | "monthly" | "weekly";

/** Display order on a tile, most important first. */
export const MARKER_ORDER: MarkerKind[] = ["prohibited", "obligatory", "night", "annual", "monthly", "weekly"];

// Muharram and Shawwal fasting span the whole month, so the month card explains them instead of marking every day.
const EVENT_MARKER: Record<HijriEventId, MarkerKind | null> = {
    ramadan: "obligatory",
    lailatulQadr: "night",
    mondayThursday: "weekly",
    ayyamulBidh: "monthly",
    muharram: null,
    tasua: "annual",
    ashura: "annual",
    muharramPair: "annual",
    shawwalSix: null,
    arafah: "annual",
    eidFitrProhibited: "prohibited",
    eidAdhaProhibited: "prohibited",
    tashreeqProhibited: "prohibited",
};

export const MARKER_LABEL: Record<MarkerKind, string> = {
    prohibited: "hijriCalendarProhibited",
    obligatory: "hijriLegendObligatory",
    night: "hijriLegendNight",
    annual: "hijriLegendAnnual",
    monthly: "hijriLegendMonthly",
    weekly: "hijriLegendWeekly",
};

export function markersFor(events: HijriEvent[]): MarkerKind[] {
    const kinds = new Set(events.map(event => EVENT_MARKER[event.id]).filter((kind): kind is MarkerKind => kind !== null));
    return MARKER_ORDER.filter(kind => kinds.has(kind));
}

const COLOR: Record<MarkerKind, string> = {
    prohibited: "text-[rgb(var(--color-danger))]",
    obligatory: "text-[rgb(var(--color-primary-strong))]",
    night: "text-[rgb(var(--color-accent-strong))]",
    annual: "text-[rgb(var(--color-accent-strong))]",
    monthly: "text-[rgb(var(--color-accent))]",
    weekly: "text-[rgb(var(--color-accent))]",
};

/** One marker shape. `inverse` is for the selected (filled) tile. */
export function Marker({ kind, inverse = false }: { kind: MarkerKind; inverse?: boolean }) {
    const color = inverse ? "text-[rgb(var(--color-primary-foreground))]" : COLOR[kind];
    switch (kind) {
        case "obligatory":
            return <span aria-hidden="true" className={cn("block h-1 w-3.5 rounded-full bg-current", color)} />;
        case "weekly":
            return <span aria-hidden="true" className={cn("block size-1.5 rounded-full bg-current", color)} />;
        case "monthly":
            return <span aria-hidden="true" className={cn("block size-2 rounded-full border-[1.5px] border-current", color)} />;
        case "annual":
            return <Star aria-hidden="true" className={cn("size-2.5 fill-current", color)} />;
        case "night":
            return <Moon aria-hidden="true" className={cn("size-2.5 fill-current", color)} />;
        case "prohibited":
            return <AlertTriangle aria-hidden="true" className={cn("size-2.5", color)} />;
    }
}

/** Up to three markers; more than three shows the first two and "+". Always takes its row so dates stay aligned. */
export function MarkerRow({ kinds, inverse = false }: { kinds: MarkerKind[]; inverse?: boolean }) {
    const shown = kinds.length > 3 ? kinds.slice(0, 2) : kinds;
    return (
        <span className="mt-0.5 flex h-2.5 items-center gap-0.5">
            {shown.map(kind => <Marker key={kind} kind={kind} inverse={inverse} />)}
            {kinds.length > 3 && <span aria-hidden="true" className="text-[8px] font-bold leading-none">+</span>}
        </span>
    );
}
