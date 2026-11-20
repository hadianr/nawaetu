import Image from "next/image";

/** The app icon (generated from public/brand/mark.svg). Decorative: pair it with a visible name. */
export default function BrandIcon({ size, className }: { size: number; className?: string }) {
    return <Image src="/icon.svg" alt="" width={size} height={size} unoptimized className={className} />;
}
