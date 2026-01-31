export const AyahMarker = ({ number }: { number: string }) => {
    return (
        <span className="relative inline-flex items-center justify-center w-12 h-12 ms-1 select-none font-sans text-[rgb(var(--color-primary))]">
            <span className="absolute inset-0 text-5xl flex items-center justify-center">۝</span>
            <span className="relative z-10 pt-2 font-bold font-amiri text-xl text-[rgb(var(--color-primary-dark))] leading-none">
                {number}
            </span>
        </span>
    );
};
