import React from "react";

export default function MissionSkeleton() {
    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
                <div className="h-4 w-12 bg-white/10 rounded-lg animate-pulse" />
            </div>

            <div className="flex gap-2 overflow-hidden pb-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[85%] sm:w-[300px] h-24 rounded-2xl bg-white/5 border border-white/5 animate-pulse p-4 flex gap-4">
                        <div className="h-10 w-10 rounded-full bg-white/10" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-white/10 rounded" />
                            <div className="h-3 w-1/2 bg-white/10 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
