import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Montréal Local", description: "Actualités, événements et vie de quartier à Montréal." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="montreal-local" title="Montréal Local" description="Actualités, événements et vie de quartier" />;
}
