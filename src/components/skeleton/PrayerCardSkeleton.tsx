
export default function PrayerCardSkeleton() {
    return (
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
            {/* Header Skeleton */}
            <div className="mb-6 space-y-2 text-center">
                <div className="mx-auto h-8 w-48 animate-pulse rounded-lg bg-white/10" />
                <div className="mx-auto h-4 w-32 animate-pulse rounded-lg bg-white/10" />
            </div>

            {/* Prayer Times Skeleton */}
            <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-xl bg-white/5 p-4"
                    >
                        <div className="h-4 w-16 animate-pulse rounded bg-white/10" />
                        <div className="h-5 w-12 animate-pulse rounded bg-white/10" />
                    </div>
                ))}
            </div>
        </div>
    );
}
