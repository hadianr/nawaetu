export const AyahMarker = ({ number }: { number: string }) => {
    return (
        <span className="relative inline-flex items-center justify-center w-10 h-10 ms-1 select-none">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[rgb(var(--color-primary))]">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" className="opacity-80" />
                <path d="M20 4V36M4 20H36" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
                <circle cx="20" cy="20" r="14" className="fill-[rgb(var(--color-primary-dark))]/20" />
            </svg>

            {/* Arabic Number Centered */}
            <span className="absolute text-sm font-bold text-[rgb(var(--color-primary-light))] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pt-[2px]">
                {number}
            </span>
        </span>
    );
};
