export const AyahMarker = ({ number, size = "medium" }: { number: string, size?: "small" | "medium" | "large" }) => {
    const sizeClasses = {
        small: { container: "w-8 h-8", symbol: "text-3xl", number: "text-sm", offset: "pt-1" },
        medium: { container: "w-12 h-12", symbol: "text-5xl", number: "text-xl", offset: "pt-1.5" },
        large: { container: "w-16 h-16", symbol: "text-7xl", number: "text-2xl", offset: "pt-2" }
    };

    const currentSize = sizeClasses[size];

    return (
        <span className={`relative inline-flex items-center justify-center ${currentSize.container} ms-1 select-none font-sans text-[rgb(var(--color-primary))] translate-y-[0.1em]`}>
            <span className={`absolute inset-0 ${currentSize.symbol} flex items-center justify-center leading-none`}>۝</span>
            <span className={`relative z-10 ${currentSize.offset} font-bold font-amiri ${currentSize.number} text-[rgb(var(--color-primary-dark))] leading-none flex items-center justify-center`}>
                {number}
            </span>
        </span>
    );
};
