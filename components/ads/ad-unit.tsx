"use client";

import { useEffect } from "react";

type AdUnitProps = {
  clientId: string;
  slot: string;
};

export function AdUnit({ clientId, slot }: AdUnitProps) {
  useEffect(() => {
    try {
      const ads = (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle;
      if (Array.isArray(ads)) {
        ads.push({});
      }
    } catch {
      // Ad blockers or script timing can fail silently without breaking the page.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block min-h-24"
      data-ad-client={clientId}
      data-ad-format="auto"
      data-ad-slot={slot}
      data-full-width-responsive="true"
    />
  );
}

