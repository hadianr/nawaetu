import React from "react";

export default function WidgetSkeleton() {
    return (
        <div className="h-full w-full rounded-3xl bg-white/5 border border-white/5 animate-pulse flex flex-col justify-between p-4">
            <div className="h-4 w-20 bg-white/10 rounded-md" />
            <div className="h-8 w-16 bg-white/10 rounded-md self-center" />
            <div className="h-3 w-24 bg-white/10 rounded-md self-center" />
        </div>
    );
}
