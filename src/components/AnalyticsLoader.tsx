"use client";

import { useEffect } from "react";

export default function AnalyticsLoader() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!id || process.env.NODE_ENV !== "production") return;

    const loadGtag = () => {
      if (document.querySelector(`script[data-ga="${id}"]`)) return;

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
    };

    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(loadGtag, { timeout: 6000 });
    } else {
      setTimeout(loadGtag, 6000);
    }
  }, []);

  return null;
}
