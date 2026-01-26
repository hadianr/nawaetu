
export default function SurahListSkeleton() {
    return (
        <div className="w-full max-w-4xl space-y-6">
            {/* Search Header Skeleton */}
            <div className="h-10 w-full rounded-md bg-white/10 animate-pulse" />

            {/* Grid Skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="flex h-24 w-full items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-white/10 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-4 w-24 rounded bg-white/10 animate-pulse" />
                                <div className="h-3 w-16 rounded bg-white/10 animate-pulse" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-6 w-16 rounded bg-white/10 animate-pulse" />
                            <div className="h-3 w-12 rounded bg-white/10 animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
