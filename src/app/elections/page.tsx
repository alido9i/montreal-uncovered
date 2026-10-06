import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ElectionLive from "@/components/elections/ElectionLive";

export const metadata: Metadata = {
  title: "Élections Québec 2026 : résultats en direct",
  description:
    "Suivez en direct les résultats de l'élection générale québécoise du 5 octobre 2026 : sièges, vote populaire et résultats par circonscription.",
  openGraph: {
    title: "Élections Québec 2026 : résultats en direct",
    description:
      "Sièges, vote populaire et résultats par circonscription, mis à jour en continu.",
    url: "/elections",
    siteName: "Montréal Uncovered",
    type: "website",
    locale: "fr_CA",
  },
  twitter: {
    card: "summary_large_image",
    title: "Élections Québec 2026 : résultats en direct",
    description: "Sièges, vote populaire et résultats par circonscription, mis à jour en continu.",
  },
};

export default function ElectionsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 w-full">
        <div className="mx-auto w-full max-w-5xl px-4 py-8">
          <ElectionLive />
        </div>
      </main>
      <Footer />
    </>
  );
}
