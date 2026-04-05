"use client";

import { useEffect, useRef } from "react";
import { ADSENSE_CLIENT_ID } from "./AdSense";

interface AdSlotProps {
  /** Data-ad-slot fourni par AdSense Console (ex: "1234567890") */
  slot: string;
  /** Format standard AdSense, "auto" par défaut (responsive) */
  format?: "auto" | "fluid" | "rectangle" | "vertical" | "horizontal";
  /** Layout key pour les annonces in-article/in-feed */
  layout?: string;
  layoutKey?: string;
  /** Responsive full-width (true par défaut) */
  responsive?: boolean;
  /** Style inline du conteneur <ins> */
  style?: React.CSSProperties;
  /** Classes additionnelles sur le wrapper */
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Ad unit réutilisable. À placer n'importe où dans une page.
 * Nécessite que AdSenseScript soit monté au niveau du layout.
 */
export default function AdSlot({
  slot,
  format = "auto",
  layout,
  layoutKey,
  responsive = true,
  style,
  className = "",
}: AdSlotProps) {
  const clientId = ADSENSE_CLIENT_ID;
  const pushed = useRef(false);

  useEffect(() => {
    if (!clientId || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (err) {
      console.error("[AdSense]", err);
    }
  }, [clientId]);

  // En dev ou sans client id, affiche un placeholder visible
  if (!clientId) {
    return (
      <div
        className={`my-6 border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center text-xs uppercase tracking-widest text-gray-400 ${className}`}
      >
        Emplacement publicitaire (slot {slot})
      </div>
    );
  }

  return (
    <div className={`my-6 text-center ${className}`}>
      <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-1">
        Publicité
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: "block", ...style }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-ad-layout={layout}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}
