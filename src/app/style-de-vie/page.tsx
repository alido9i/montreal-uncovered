import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Style de vie", description: "Tendances, conseils et vie quotidienne à Montréal." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="style-de-vie" title="Style de vie" description="Tendances, conseils et vie quotidienne" />;
}
