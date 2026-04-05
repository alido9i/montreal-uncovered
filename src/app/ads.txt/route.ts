/**
 * ads.txt requis par Google AdSense.
 * Format : <DOMAIN>, <PUBLISHER ID>, <RELATIONSHIP>, <CERT AUTHORITY ID>
 * Doc : https://support.google.com/adsense/answer/7532444
 */
import { ADSENSE_CLIENT_ID } from "@/components/AdSense";

export function GET() {
  // Le publisher ID dans ads.txt = ca-pub-XXX sans le "ca-"
  const pubId = ADSENSE_CLIENT_ID.replace(/^ca-/, "");
  const body = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
