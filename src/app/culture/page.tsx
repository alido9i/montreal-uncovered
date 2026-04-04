import CategoryPage from "@/components/CategoryPage";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Culture", description: "Films, humour, arts et tendances montréalaises." };
export const dynamic = "force-dynamic";

export default function Page() {
  return <CategoryPage slug="culture" title="Culture" description="Films, humour, arts et tendances" />;
}
