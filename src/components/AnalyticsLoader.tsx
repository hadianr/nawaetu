"use client";

import { useEffect } from "react";

export default function AnalyticsLoader() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!id || process.env.NODE_ENV !== "production") return;

    let analyticsLoaded = false;

    const loadGtag = () => {
      if (analyticsLoaded || document.querySelector(`script[data-ga="${id}"]`)) {
        return;
      }
      analyticsLoaded = true;

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
      script.setAttribute("data-ga", id);
      document.head.appendChild(script);

      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag("js", new Date());
      gtag("config", id, { page_path: window.location.pathname });

      // Remove event listeners after loading
      document.removeEventListener("click", onUserInteraction);
      document.removeEventListener("scroll", onUserInteraction);
      document.removeEventListener("keydown", onUserInteraction);
      document.removeEventListener("touchstart", onUserInteraction);
    };

    const onUserInteraction = () => {
      loadGtag();
    };

    // Add listeners for first user interaction (very low cost)
    // This way GA doesn't block FCP/LCP but still captures all engaged users
    document.addEventListener("click", onUserInteraction, { once: true, passive: true });
    document.addEventListener("scroll", onUserInteraction, { once: true, passive: true });
    document.addEventListener("keydown", onUserInteraction, { once: true, passive: true });
    document.addEventListener("touchstart", onUserInteraction, { once: true, passive: true });

    // Fallback: load after 15 seconds if user hasn't interacted
    // (captures users who just read the page without clicking)
    const timeout = setTimeout(loadGtag, 15000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", onUserInteraction);
      document.removeEventListener("scroll", onUserInteraction);
      document.removeEventListener("keydown", onUserInteraction);
      document.removeEventListener("touchstart", onUserInteraction);
    };
  }, []);

  return null;
}
