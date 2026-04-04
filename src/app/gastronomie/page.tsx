import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gastronomie", description: "Restaurants, cafés, food trucks et recettes montréalaises." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="gastronomie" title="Gastronomie" description="Restaurants, cafés, food trucks et recettes" />;
}
