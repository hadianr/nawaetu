
export default function PrayerCardSkeleton() {
    return (
        <div className="w-full max-w-md rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-md shadow-lg">
            {/* Prayer Times Skeleton (7 items to match Imsak + 5 Prayers + Sunrise) */}
            <div className="space-y-3">
                {[...Array(7)].map((_, i) => (
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
