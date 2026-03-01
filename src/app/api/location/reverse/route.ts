/**
 * Nawaetu - Islamic Habit Tracker
 * Copyright (C) 2026 Hadian Rahmat
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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

        const parsedLat = parseFloat(lat);
        const parsedLng = parseFloat(lng);

        if (
            Number.isNaN(parsedLat) ||
            Number.isNaN(parsedLng) ||
            parsedLat < -90 ||
            parsedLat > 90 ||
            parsedLng < -180 ||
            parsedLng > 180
        ) {
            return NextResponse.json(
                { success: false, error: "Invalid latitude or longitude" },
                { status: 400 }
            );
        }

        // 1. Try BigDataCloud first (usually faster, good global coverage)
        let resolvedName: string | null = null;
        let resolvedCity: string | null = null;
        let resolvedCountry: string | null = null;
        let resolvedCountryCode: string | null = null;

        try {
            const bdcUrl = `${API_CONFIG.LOCATION.BIGDATA_CLOUD}?latitude=${parsedLat}&longitude=${parsedLng}&localityLanguage=id`;
            const bdcRes = await fetch(bdcUrl, {
                next: { revalidate: 86400 }, // Cache on Vercel Edge for 24h
            });

            if (bdcRes.ok) {
                const bdcData = await bdcRes.json();
                // For display name: use locality (kecamatan) for precision
                resolvedName = bdcData.locality || bdcData.city || bdcData.principalSubdivision || bdcData.countryName;
                // For city-level analytics: use city or principalSubdivision (kabupaten/kota)
                resolvedCity = bdcData.city || bdcData.principalSubdivision || bdcData.locality;
                resolvedCountry = bdcData.countryName || null;
                resolvedCountryCode = bdcData.countryCode?.toLowerCase() || null;
            }
        } catch (e) {
            console.warn("[LocationProxy] BigDataCloud failed:", e);
        }

        // 2. Try Nominatim (OpenStreetMap) if BigDataCloud fails or returns nothing
        if (!resolvedName) {
            try {
                const nomUrl = `${API_CONFIG.LOCATION.NOMINATIM}?format=jsonv2&lat=${parsedLat}&lon=${parsedLng}&accept-language=id&email=nawaetu.app@gmail.com`;

                // IMPORTANT: We MUST set a User-Agent server-side, otherwise Nominatim blocks it.
                const nomRes = await fetch(nomUrl, {
                    headers: { "User-Agent": "NawaetuApp/1.0 (NextJS Server Proxy)" },
                    next: { revalidate: 86400 },
                });

                if (nomRes.ok) {
                    const locData = await nomRes.json();
                    const addr = locData.address || {};

                    // Display name: show sub-district for precision (user-facing label)
                    resolvedName =
                        addr.suburb || addr.subdistrict || addr.village ||
                        addr.city || addr.town || addr.county ||
                        locData.display_name?.split(",")[0];

                    // City-level (Kabupaten/Kota): for analytics, skip sub-districts
                    resolvedCity =
                        addr.city || addr.city_district || addr.county ||
                        addr.municipality || addr.town || addr.state_district ||
                        addr.state;

                    resolvedCountry = addr.country || null;
                    resolvedCountryCode = addr.country_code?.toLowerCase() || null;
                }
            } catch (e) {
                console.warn("[LocationProxy] Nominatim failed:", e);
            }
        }

        if (resolvedName) {
            return NextResponse.json({
                success: true,
                name: resolvedName,
                city: resolvedCity || resolvedName,
                country: resolvedCountry,
                countryCode: resolvedCountryCode,
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
