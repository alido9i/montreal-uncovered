import Script from "next/script";

/** Publisher ID Montréal Uncovered — override possible via NEXT_PUBLIC_ADSENSE_CLIENT_ID */
export const ADSENSE_CLIENT_ID =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-0095162813653576";

/**
 * Charge le script Google AdSense globalement.
 * À placer une seule fois dans le root layout.
 */
export default function AdSenseScript() {
  const clientId = ADSENSE_CLIENT_ID;
  if (!clientId) return null;

  return (
    <Script
      id="adsbygoogle-init"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
    />
  );
}
