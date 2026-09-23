"use client";

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

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import type { AnalyticsWindow } from "@/lib/analytics/analytics";

export default function AnalyticsLoader() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (!id || process.env.NODE_ENV !== "production") return;

    const loadOnInteraction = () => setShouldLoad(true);
    window.addEventListener("pointerdown", loadOnInteraction, { once: true, passive: true });
    window.addEventListener("keydown", loadOnInteraction, { once: true });

    if ("requestIdleCallback" in window) {
      (window as Window).requestIdleCallback(() => setShouldLoad(true), { timeout: 2000 });
      return () => {
        window.removeEventListener("pointerdown", loadOnInteraction);
        window.removeEventListener("keydown", loadOnInteraction);
      };
    }

    const timeoutId = setTimeout(() => setShouldLoad(true), 2000);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("pointerdown", loadOnInteraction);
      window.removeEventListener("keydown", loadOnInteraction);
    };
  }, [id]);

  // Track every initial/SPA page view explicitly so lazy loading does not
  // lose navigation events that happen before gtag is ready.
  useEffect(() => {
    if (!id || process.env.NODE_ENV !== "production") return;

    const queryString = searchParams?.toString();
    const fullPath = pathname + (queryString ? `?${queryString}` : "");

    const analyticsWindow = window as AnalyticsWindow;
    const pageView = {
      page_location: window.location.href,
      page_path: fullPath,
      send_to: id,
    };

    analyticsWindow.dataLayer ??= [];
    if (typeof analyticsWindow.gtag === "function") {
      analyticsWindow.gtag("event", "page_view", pageView);
    } else {
      analyticsWindow.dataLayer.push(["event", "page_view", pageView]);
    }
  }, [id, pathname, searchParams]);

  if (!id || process.env.NODE_ENV !== "production" || !shouldLoad) return null;

  return (
    <>
      <Script
        id="ga-script"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script
        id="ga-init"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${id}', {
              page_location: window.location.href,
              page_path: window.location.pathname + window.location.search,
              send_page_view: false
            });
          `,
        }}
      />
    </>
  );
}
