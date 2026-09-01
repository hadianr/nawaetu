type SyncRecord = Record<string, unknown>;

const asRecords = (value: unknown): SyncRecord[] =>
    Array.isArray(value) ? value.filter((item): item is SyncRecord => !!item && typeof item === "object") : [];

function keyFor(item: SyncRecord, domain: "bookmark" | "mission" | "intention"): string | null {
    if (domain === "bookmark") {
        if (typeof item.id === "string") return item.id;
        if (item.surahId != null && item.verseId != null) return `${item.surahId}:${item.verseId}`;
    }

    if (domain === "mission") {
        const id = item.id ?? item.missionId;
        if (id != null) return `${id}:${String(item.completedAt ?? "").slice(0, 10)}`;
    }

    if (domain === "intention") {
        const date = item.intentionDate ?? item.niatDate;
        if (date != null) return String(date).slice(0, 10);
    }

    return null;
}

/** Server wins conflicts; local-only records are retained for later sync. */
export function mergeSyncRecords(
    local: unknown,
    server: unknown,
    domain: "bookmark" | "mission" | "intention",
): SyncRecord[] {
    const localRecords = asRecords(local);
    const serverRecords = asRecords(server);
    const serverKeys = new Set(serverRecords.map((item) => keyFor(item, domain)).filter(Boolean));

    return [
        ...serverRecords,
        ...localRecords.filter((item) => {
            const key = keyFor(item, domain);
            return !key || !serverKeys.has(key);
        }),
    ];
}
