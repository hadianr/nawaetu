import QiblaCompass from "@/components/QiblaCompass";

export default function KiblatPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] p-6 text-white font-sans">
            <div className="w-full max-w-md space-y-8 text-center">


                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <QiblaCompass />
                    </div>
                </div>
            </div>
        </div>
    );
}
