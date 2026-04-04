import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ailleurs", description: "Le monde vu de Montréal." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="ailleurs" title="Ailleurs" description="Le monde vu de Montréal" />;
}
