import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Société", description: "Débats, enjeux et reportages sur la société montréalaise." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="societe" title="Société" description="Débats, enjeux et reportages" />;
}
