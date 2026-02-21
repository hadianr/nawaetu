import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/apis";

// Next.js API route to proxy reverse geocoding requests
// By performing the fetch server-side, we bypass Safari iOS Safari Incognito ITP
// and strict CORS rules that drop Nominatim/BigDataCloud requests.

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");

        if (!lat || !lng) {
            return NextResponse.json(
                { success: false, error: "Missing latitude or longitude" },
                { status: 400 }
            );
        }

        // 1. Try BigDataCloud first (usually faster, good global coverage)
        let resolvedName = null;
        try {
            const bdcUrl = `${API_CONFIG.LOCATION.BIGDATA_CLOUD}?latitude=${lat}&longitude=${lng}&localityLanguage=id`;
            const bdcRes = await fetch(bdcUrl, {
                next: { revalidate: 86400 }, // Cache on Vercel Edge for 24h
            });

            if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                resolvedName =
                    bdcData.locality ||
                    bdcData.city ||
                    bdcData.principalSubdivision ||
                    bdcData.countryName;
            }
        } catch (e) {
            console.warn("[LocationProxy] BigDataCloud failed:", e);
        }

        // 2. Try Nominatim (OpenStreetMap) if BigDataCloud fails or returns nothing
        if (!resolvedName) {
            try {
                const nomUrl = `${API_CONFIG.LOCATION.NOMINATIM}?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=id&email=nawaetu.app@gmail.com`;

                // IMPORTANT: We MUST set a User-Agent server-side, otherwise Nominatim blocks it.
                // We couldn't do this client-side due to browser Fetch API security restrictions.
                const nomRes = await fetch(nomUrl, {
                    headers: {
                        "User-Agent": "NawaetuApp/1.0 (NextJS Server Proxy)",
                    },
                    next: { revalidate: 86400 },
                });

                if (nomRes.ok) {
                    const locData = await nomRes.json();
                    const addr = locData.address || {};
                    resolvedName =
                        addr.subdistrict ||
                        addr.village ||
                        addr.municipality ||
                        addr.city ||
                        addr.town ||
                        addr.state ||
                        locData.display_name?.split(",")[0];
                }
            } catch (e) {
                console.warn("[LocationProxy] Nominatim failed:", e);
            }
        }

        if (resolvedName) {
            return NextResponse.json({
                success: true,
                name: resolvedName,
                from: "proxy"
            });
        }

        // 3. Complete failure of both APIs
        return NextResponse.json(
            { success: false, error: "Cloud providers failed to resolve location" },
            { status: 502 }
        );

    } catch (error) {
        console.error("[LocationProxy] Fatal error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error during geocoding" },
            { status: 500 }
        );
    }
}
